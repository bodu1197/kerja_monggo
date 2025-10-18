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

async function getTableStructure() {
  console.log('📋 company_profiles 테이블 샘플 데이터...\n')

  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .limit(1)

  if (error) {
    console.log('❌ 오류:', error.message)
  } else {
    console.log('컬럼 목록:')
    if (data && data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        console.log(`  - ${key}`)
      })
    } else {
      console.log('데이터가 없어서 컬럼 확인 불가')
      console.log('\napplications 테이블 확인...')

      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*')
        .limit(1)

      if (!appError && appData && appData.length > 0) {
        console.log('\napplications 컬럼:')
        Object.keys(appData[0]).forEach(key => {
          console.log(`  - ${key}`)
        })
      }
    }
  }
}

getTableStructure()
