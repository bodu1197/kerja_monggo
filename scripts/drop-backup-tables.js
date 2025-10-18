const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrtldeesmhmempfafcsm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydGxkZWVzbWhtZW1wZmFmY3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzE1OTcsImV4cCI6MjA3NTYwNzU5N30.NPwRK1JXbv14m82QmOiUl0u5LM9xAttMOMAreA7b-RM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function dropBackupTables() {
  console.log('백업 테이블 삭제를 시작합니다...\n');

  const tables = [
    '_backup_favorites',
    '_backup_product_comments',
    '_backup_product_images',
    '_backup_view_history',
    '_backup_trash_products',
    '_backup_products'
  ];

  for (const table of tables) {
    try {
      console.log(`${table} 테이블 삭제 중...`);

      // RPC 함수를 통해 SQL 실행
      const { data, error } = await supabase.rpc('exec_sql', {
        query: `DROP TABLE IF EXISTS public.${table} CASCADE;`
      });

      if (error) {
        console.error(`❌ ${table} 삭제 실패:`, error.message);
      } else {
        console.log(`✅ ${table} 테이블이 삭제되었습니다.`);
      }
    } catch (err) {
      console.error(`❌ ${table} 처리 중 오류:`, err.message);
    }
  }

  console.log('\n백업 테이블 삭제 작업이 완료되었습니다.');
}

// RPC 함수가 없을 경우를 대비한 대체 방법
async function checkAndDropTables() {
  console.log('백업 테이블 존재 여부를 확인합니다...\n');

  try {
    // 테이블 목록 조회
    const { data: tables, error } = await supabase
      .from('_backup_products')
      .select('*')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('✅ 백업 테이블이 이미 삭제되었거나 존재하지 않습니다.');
      return;
    }

    console.log('⚠️  백업 테이블이 존재합니다.');
    console.log('\n다음 SQL을 Supabase 대시보드의 SQL Editor에서 실행해주세요:\n');
    console.log('```sql');
    console.log(`-- 기존 마켓플레이스 백업 테이블 삭제
DROP TABLE IF EXISTS public._backup_favorites CASCADE;
DROP TABLE IF EXISTS public._backup_product_comments CASCADE;
DROP TABLE IF EXISTS public._backup_product_images CASCADE;
DROP TABLE IF EXISTS public._backup_view_history CASCADE;
DROP TABLE IF EXISTS public._backup_trash_products CASCADE;
DROP TABLE IF EXISTS public._backup_products CASCADE;`);
    console.log('```');

  } catch (err) {
    console.error('오류:', err.message);
  }
}

// 메인 실행
checkAndDropTables();