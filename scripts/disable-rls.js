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
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  console.log('SUPABASE_SERVICE_ROLE_KEY가 .env.local에 필요합니다.')
  process.exit(1)
}

// Service role key 사용 (RLS 우회 가능)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function disableRLS() {
  console.log('🔓 RLS 비활성화 중...\n')

  const queries = [
    'ALTER TABLE provinces DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE regencies DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE categories DISABLE ROW LEVEL SECURITY;'
  ]

  for (const query of queries) {
    console.log('실행:', query)
    const { error } = await supabase.rpc('exec_sql', { sql: query })

    if (error) {
      console.error('❌ 오류:', error.message)
    } else {
      console.log('✅ 성공\n')
    }
  }

  console.log('\n✅ RLS 비활성화 완료!')
  console.log('\n데이터 확인 중...')

  // 데이터 확인
  const { data: provinces, error: pError } = await supabase
    .from('provinces')
    .select('*')
    .limit(3)

  if (pError) {
    console.error('❌ Provinces 오류:', pError.message)
  } else {
    console.log(`✅ Provinces: ${provinces.length}개 확인됨`)
    if (provinces.length > 0) {
      console.log('   첫 항목:', provinces[0].province_name)
    }
  }
}

disableRLS()
