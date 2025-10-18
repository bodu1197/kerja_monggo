const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// .env.local 파일 읽기
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertTestData() {
  console.log('🚀 테스트 데이터 삽입 시작...\n')

  // Provinces
  console.log('📍 Provinces 삽입 중...')
  const provinces = [
    { province_id: 1, province_name: 'DKI Jakarta' },
    { province_id: 2, province_name: 'Jawa Barat' },
    { province_id: 3, province_name: 'Jawa Tengah' },
    { province_id: 4, province_name: 'Jawa Timur' },
    { province_id: 5, province_name: 'Banten' },
  ]

  const { data: provData, error: provError } = await supabase
    .from('provinces')
    .upsert(provinces, { onConflict: 'province_id' })

  if (provError) {
    console.error('❌ Provinces 오류:', provError.message)
  } else {
    console.log('✅ Provinces 삽입 완료\n')
  }

  // Regencies
  console.log('📍 Regencies 삽입 중...')
  const regencies = [
    { regency_id: 101, regency_name: 'Jakarta Pusat', province_id: 1 },
    { regency_id: 102, regency_name: 'Jakarta Selatan', province_id: 1 },
    { regency_id: 103, regency_name: 'Jakarta Timur', province_id: 1 },
    { regency_id: 201, regency_name: 'Bandung Kota', province_id: 2 },
    { regency_id: 202, regency_name: 'Bekasi Kota', province_id: 2 },
    { regency_id: 203, regency_name: 'Depok', province_id: 2 },
  ]

  const { data: regData, error: regError } = await supabase
    .from('regencies')
    .upsert(regencies, { onConflict: 'regency_id' })

  if (regError) {
    console.error('❌ Regencies 오류:', regError.message)
  } else {
    console.log('✅ Regencies 삽입 완료\n')
  }

  // Categories (parent)
  console.log('📁 Categories 삽입 중...')
  const categories = [
    { category_id: 1, name: 'IT & Teknologi', parent_category: null },
    { category_id: 2, name: 'Marketing & Penjualan', parent_category: null },
    { category_id: 3, name: 'Keuangan & Akuntansi', parent_category: null },
    { category_id: 4, name: 'SDM & Rekrutmen', parent_category: null },
    { category_id: 5, name: 'Pendidikan', parent_category: null },
  ]

  const { data: catData, error: catError } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'category_id' })

  if (catError) {
    console.error('❌ Categories 오류:', catError.message)
  } else {
    console.log('✅ Categories 삽입 완료\n')
  }

  // Subcategories
  console.log('📁 Subcategories 삽입 중...')
  const subcategories = [
    { category_id: 101, name: 'Software Developer', parent_category: 1 },
    { category_id: 102, name: 'Web Developer', parent_category: 1 },
    { category_id: 103, name: 'Mobile Developer', parent_category: 1 },
    { category_id: 104, name: 'Data Analyst', parent_category: 1 },
    { category_id: 201, name: 'Digital Marketing', parent_category: 2 },
    { category_id: 202, name: 'Sales Executive', parent_category: 2 },
    { category_id: 301, name: 'Akuntan', parent_category: 3 },
    { category_id: 302, name: 'Financial Analyst', parent_category: 3 },
  ]

  const { data: subData, error: subError } = await supabase
    .from('categories')
    .upsert(subcategories, { onConflict: 'category_id' })

  if (subError) {
    console.error('❌ Subcategories 오류:', subError.message)
  } else {
    console.log('✅ Subcategories 삽입 완료\n')
  }

  console.log('✅ 모든 테스트 데이터 삽입 완료!')
}

insertTestData()
