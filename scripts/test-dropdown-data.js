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

async function testDropdownData() {
  console.log('🔍 드롭다운 데이터 테스트 시작...\n')
  console.log('📍 Supabase URL:', supabaseUrl)
  console.log('🔑 API Key:', supabaseKey.substring(0, 20) + '...\n')

  // Test Provinces
  console.log('1️⃣ Provinces 테스트...')
  const { data: provinces, error: provError } = await supabase
    .from('provinces')
    .select('province_id, province_name')
    .order('province_name')

  if (provError) {
    console.error('❌ Provinces 오류:', provError.message)
  } else {
    console.log(`✅ Provinces: ${provinces.length}개 로드됨`)
    if (provinces.length > 0) {
      console.log('   첫 3개:', provinces.slice(0, 3).map(p => p.province_name).join(', '))
    }
  }
  console.log()

  // Test Regencies (for province 11 - Aceh)
  console.log('2️⃣ Regencies 테스트 (province_id=11)...')
  const { data: regencies, error: regError } = await supabase
    .from('regencies')
    .select('regency_id, regency_name')
    .eq('province_id', 11)
    .order('regency_name')

  if (regError) {
    console.error('❌ Regencies 오류:', regError.message)
  } else {
    console.log(`✅ Regencies: ${regencies.length}개 로드됨`)
    if (regencies.length > 0) {
      console.log('   첫 3개:', regencies.slice(0, 3).map(r => r.regency_name).join(', '))
    }
  }
  console.log()

  // Test Categories (parent only)
  console.log('3️⃣ Categories 테스트 (1차 카테고리)...')
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('category_id, name')
    .is('parent_category', null)
    .order('name')

  if (catError) {
    console.error('❌ Categories 오류:', catError.message)
  } else {
    console.log(`✅ Categories: ${categories.length}개 로드됨`)
    if (categories.length > 0) {
      console.log('   첫 3개:', categories.slice(0, 3).map(c => c.name).join(', '))
    }
  }
  console.log()

  // Test Subcategories (for category 1)
  if (categories && categories.length > 0) {
    const firstCategoryId = categories[0].category_id
    console.log(`4️⃣ Subcategories 테스트 (parent=${firstCategoryId})...`)
    const { data: subcategories, error: subError } = await supabase
      .from('categories')
      .select('category_id, name')
      .eq('parent_category', firstCategoryId)
      .order('name')

    if (subError) {
      console.error('❌ Subcategories 오류:', subError.message)
    } else {
      console.log(`✅ Subcategories: ${subcategories.length}개 로드됨`)
      if (subcategories.length > 0) {
        console.log('   첫 3개:', subcategories.slice(0, 3).map(s => s.name).join(', '))
      }
    }
    console.log()
  }

  console.log('✅ 모든 드롭다운 데이터 테스트 완료!')
  console.log('\n📝 결과 요약:')
  console.log(`   - Provinces: ${provinces?.length || 0}개`)
  console.log(`   - Regencies: ${regencies?.length || 0}개 (province 11)`)
  console.log(`   - Categories: ${categories?.length || 0}개`)
  console.log('\n✨ 개발 서버에서 /post 페이지를 열고 브라우저 캐시를 지우세요 (Ctrl+Shift+R)')
}

testDropdownData()
