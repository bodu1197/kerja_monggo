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

async function checkData() {
  console.log('📊 데이터 확인 중...\n')

  // Provinces
  const { data: provinces, error: provError } = await supabase
    .from('provinces')
    .select('*')

  console.log('📍 Provinces:')
  if (provError) {
    console.error('   ❌ 오류:', provError.message)
  } else {
    console.log(`   ✅ ${provinces?.length || 0}개 항목`)
    if (provinces && provinces.length > 0) {
      console.log('   처음 3개:', provinces.slice(0, 3).map(p => p.province_name).join(', '))
    }
  }

  // Regencies
  const { data: regencies, error: regError } = await supabase
    .from('regencies')
    .select('*')

  console.log('\n📍 Regencies:')
  if (regError) {
    console.error('   ❌ 오류:', regError.message)
  } else {
    console.log(`   ✅ ${regencies?.length || 0}개 항목`)
    if (regencies && regencies.length > 0) {
      console.log('   처음 3개:', regencies.slice(0, 3).map(r => r.regency_name).join(', '))
    }
  }

  // Categories (parent only)
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .is('parent_category', null)

  console.log('\n📁 Categories (대분류):')
  if (catError) {
    console.error('   ❌ 오류:', catError.message)
  } else {
    console.log(`   ✅ ${categories?.length || 0}개 항목`)
    if (categories && categories.length > 0) {
      console.log('   처음 3개:', categories.slice(0, 3).map(c => c.name).join(', '))
    }
  }

  // Subcategories
  const { data: subcategories, error: subError } = await supabase
    .from('categories')
    .select('*')
    .not('parent_category', 'is', null)

  console.log('\n📁 Subcategories (소분류):')
  if (subError) {
    console.error('   ❌ 오류:', subError.message)
  } else {
    console.log(`   ✅ ${subcategories?.length || 0}개 항목`)
    if (subcategories && subcategories.length > 0) {
      console.log('   처음 3개:', subcategories.slice(0, 3).map(c => c.name).join(', '))
    }
  }

  console.log('\n---')
  if (!provinces || provinces.length === 0) {
    console.log('\n⚠️  데이터가 비어있습니다!')
    console.log('   supabase/migrations/02_insert_initial_data.sql 파일을')
    console.log('   Supabase Dashboard > SQL Editor에서 실행하세요.')
  } else {
    console.log('\n✅ 모든 데이터가 정상적으로 로드되었습니다!')
  }
}

checkData()
