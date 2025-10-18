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

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSubcategories() {
  console.log('🔍 카테고리 구조 확인...\n')

  // Get all categories
  const { data: allCategories, error } = await supabase
    .from('categories')
    .select('category_id, name, parent_category')
    .order('category_id')

  if (error) {
    console.error('❌ 오류:', error.message)
    return
  }

  console.log(`총 카테고리 수: ${allCategories.length}\n`)

  // Group by parent
  const parentCategories = allCategories.filter(c => c.parent_category === null)
  const childCategories = allCategories.filter(c => c.parent_category !== null)

  console.log('📂 1차 카테고리 (parent_category = null):')
  parentCategories.forEach(c => {
    console.log(`   ${c.category_id}: ${c.name}`)
  })
  console.log()

  console.log('📁 2차 카테고리 (parent_category 있음):')
  childCategories.slice(0, 10).forEach(c => {
    console.log(`   ${c.category_id}: ${c.name} (부모: ${c.parent_category})`)
  })
  if (childCategories.length > 10) {
    console.log(`   ... 외 ${childCategories.length - 10}개 더`)
  }
  console.log()

  // Test specific query like the code does
  console.log('🧪 테스트: "IT/Teknologi" 카테고리의 하위 항목 조회')
  const { data: itSubs, error: itError } = await supabase
    .from('categories')
    .select('category_id, name')
    .eq('parent_category', 'IT/Teknologi')
    .order('name')

  if (itError) {
    console.error('❌ 오류:', itError.message)
  } else {
    console.log(`✅ ${itSubs.length}개 발견:`)
    itSubs.forEach(s => {
      console.log(`   - ${s.name}`)
    })
  }
}

checkSubcategories()
