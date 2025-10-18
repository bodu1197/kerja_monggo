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
// Use service role key instead of anon key to bypass RLS
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 SQL로 직접 테이블 확인...\n')

  // Try direct table access
  const { data: comp, error: e1 } = await supabase
    .from('companies')
    .select('id')
    .limit(1)

  if (e1) {
    console.log('❌ companies 테이블:', e1.message)
  } else {
    console.log('✅ companies 테이블 접근 가능')
  }

  const { data: jobs, error: e2 } = await supabase
    .from('jobs')
    .select('id')
    .limit(1)

  if (e2) {
    console.log('❌ jobs 테이블:', e2.message)
  } else {
    console.log('✅ jobs 테이블 접근 가능')
  }

  const { data: profiles, error: e3 } = await supabase
    .from('company_profiles')
    .select('profile_id')
    .limit(1)

  if (e3) {
    console.log('❌ company_profiles 테이블:', e3.message)
  } else {
    console.log('✅ company_profiles 테이블 접근 가능')
  }
}

checkTables()
