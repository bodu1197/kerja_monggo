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

async function checkTables() {
  console.log('🔍 테이블 존재 확인...\n')

  // Check companies table
  console.log('1️⃣ companies 테이블 확인...')
  const { data: companies, error: compError } = await supabase
    .from('companies')
    .select('id, company_name')
    .limit(1)

  if (compError) {
    console.error('❌ 오류:', compError.message)
  } else {
    console.log(`✅ companies 테이블 존재 (데이터: ${companies.length}개)`)
  }
  console.log()

  // Check jobs table
  console.log('2️⃣ jobs 테이블 확인...')
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id, title, status')
    .limit(1)

  if (jobsError) {
    console.error('❌ 오류:', jobsError.message)
  } else {
    console.log(`✅ jobs 테이블 존재 (데이터: ${jobs.length}개)`)
  }
  console.log()

  // Check company_profiles (기존 테이블)
  console.log('3️⃣ company_profiles 테이블 확인...')
  const { data: profiles, error: profError } = await supabase
    .from('company_profiles')
    .select('profile_id, company_name')
    .limit(1)

  if (profError) {
    console.error('❌ 오류:', profError.message)
  } else {
    console.log(`✅ company_profiles 테이블 존재 (데이터: ${profiles.length}개)`)
  }
}

checkTables()
