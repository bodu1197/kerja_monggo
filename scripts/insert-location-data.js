const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse SQL INSERT statement and extract values
function parseSqlInsert(sqlContent, tableName) {
  // Find the VALUES keyword and extract everything after it
  const valuesIndex = sqlContent.indexOf('VALUES');
  if (valuesIndex === -1) {
    throw new Error(`Could not find VALUES keyword for ${tableName}`);
  }

  const valuesString = sqlContent.substring(valuesIndex + 6).trim();
  const rows = [];

  // Match individual row tuples - handle nested parentheses and quoted commas
  const tupleRegex = /\('([^']+)',\s*'([^']+)',\s*'([^']+)'(?:,\s*'([^']+)')?(?:,\s*'([^']+)')?\)/g;
  let tupleMatch;

  while ((tupleMatch = tupleRegex.exec(valuesString)) !== null) {
    // Remove the full match and add individual captures
    const values = tupleMatch.slice(1).filter(v => v !== undefined);
    rows.push(values);
  }

  return rows;
}

async function insertProvinces() {
  console.log('Reading provinces_rows.sql...');
  const sqlContent = fs.readFileSync(
    path.join(__dirname, '..', 'provinces_rows.sql'),
    'utf8'
  );

  console.log('Parsing province data...');
  const rows = parseSqlInsert(sqlContent, 'provinces');

  const provinces = rows.map(([province_id, province_name]) => ({
    province_id: parseInt(province_id),
    province_name: province_name
  }));

  console.log(`Found ${provinces.length} provinces`);
  console.log('Inserting into Supabase...');

  // Insert in batches to avoid timeouts
  const batchSize = 50;
  for (let i = 0; i < provinces.length; i += batchSize) {
    const batch = provinces.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('provinces')
      .upsert(batch, { onConflict: 'province_id' });

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      throw error;
    }
    console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} rows)`);
  }

  console.log('✓ Provinces inserted successfully!');
}

async function insertRegencies() {
  console.log('\nReading regencies_rows.sql...');
  const sqlContent = fs.readFileSync(
    path.join(__dirname, '..', 'regencies_rows.sql'),
    'utf8'
  );

  console.log('Parsing regency data...');
  const rows = parseSqlInsert(sqlContent, 'regencies');

  const regencies = rows.map(([regency_id, province_id, regency_name, latitude, longitude]) => ({
    regency_id: parseInt(regency_id),
    province_id: parseInt(province_id),
    regency_name: regency_name,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude)
  }));

  console.log(`Found ${regencies.length} regencies`);
  console.log('Inserting into Supabase...');

  // Insert in batches to avoid timeouts
  const batchSize = 100;
  for (let i = 0; i < regencies.length; i += batchSize) {
    const batch = regencies.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('regencies')
      .upsert(batch, { onConflict: 'regency_id' });

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      throw error;
    }
    console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} rows)`);
  }

  console.log('✓ Regencies inserted successfully!');
}

async function main() {
  try {
    console.log('Starting data insertion...\n');

    await insertProvinces();
    await insertRegencies();

    console.log('\n✓ All location data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

main();
