const fs = require('fs');
const path = require('path');

// Read the original SQL file
const inputFile = path.join(__dirname, '..', 'regencies_rows.sql');
const outputFile = path.join(__dirname, '..', 'supabase', 'migrations', '20251020000002_insert_regencies_data.sql');

console.log('Reading regencies_rows.sql...');
const sqlContent = fs.readFileSync(inputFile, 'utf8');

console.log('Converting SQL...');

// Extract the INSERT statement
const valuesIndex = sqlContent.indexOf('VALUES');
if (valuesIndex === -1) {
  console.error('Could not find VALUES keyword');
  process.exit(1);
}

const valuesString = sqlContent.substring(valuesIndex + 6).trim();

// Parse all tuples and extract the first 5 fields (excluding created_at)
const tupleRegex = /\('(\d+)',\s*'(\d+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'[^']+'\)/g;
const matches = [];
let match;

while ((match = tupleRegex.exec(valuesString)) !== null) {
  const [_, regency_id, province_id, regency_name, latitude, longitude] = match;
  matches.push({ regency_id, province_id, regency_name, latitude, longitude });
}

console.log(`Found ${matches.length} regencies`);

// Generate new SQL
let newSql = '-- Insert Indonesian regencies data\n\n';
newSql += 'INSERT INTO "public"."regencies" ("regency_id", "province_id", "regency_name", "latitude", "longitude") VALUES\n';

const valueLines = matches.map((m, index) => {
  const line = `(${m.regency_id}, ${m.province_id}, '${m.regency_name}', ${m.latitude}, ${m.longitude})`;
  return index === matches.length - 1 ? line : line + ',';
});

newSql += valueLines.join('\n');
newSql += '\nON CONFLICT (regency_id) DO NOTHING;\n';

console.log('Writing to migration file...');
fs.writeFileSync(outputFile, newSql);

console.log(`✓ Successfully created ${outputFile}`);
console.log(`  Total regencies: ${matches.length}`);
