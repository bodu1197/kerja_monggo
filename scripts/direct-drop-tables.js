// Supabase 직접 연결을 통한 백업 테이블 삭제 스크립트
// 주의: 이 스크립트는 데이터베이스에 직접 접근하므로 신중하게 사용하세요

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xrtldeesmhmempfafcsm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydGxkZWVzbWhtZW1wZmFmY3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzE1OTcsImV4cCI6MjA3NTYwNzU5N30.NPwRK1JXbv14m82QmOiUl0u5LM9xAttMOMAreA7b-RM';

console.log('=====================================');
console.log('백업 테이블 삭제 안내');
console.log('=====================================\n');

console.log('현재 Supabase CLI를 통한 직접 삭제가 불가능한 상황입니다.');
console.log('다음 방법 중 하나를 선택하여 백업 테이블을 삭제해주세요:\n');

console.log('방법 1: Supabase 대시보드 사용 (권장)');
console.log('---------------------------------------');
console.log('1. https://supabase.com/dashboard/project/xrtldeesmhmempfafcsm 접속');
console.log('2. 왼쪽 메뉴에서 "SQL Editor" 클릭');
console.log('3. 아래 SQL 복사하여 실행:\n');

const dropTableSQL = `-- 기존 마켓플레이스 백업 테이블 삭제
-- 이 테이블들은 구인구직 플랫폼에 불필요하므로 완전히 제거합니다

-- 외래키 제약조건이 있을 수 있으므로 CASCADE 옵션 사용
DROP TABLE IF EXISTS public._backup_favorites CASCADE;
DROP TABLE IF EXISTS public._backup_product_comments CASCADE;
DROP TABLE IF EXISTS public._backup_product_images CASCADE;
DROP TABLE IF EXISTS public._backup_view_history CASCADE;
DROP TABLE IF EXISTS public._backup_trash_products CASCADE;
DROP TABLE IF EXISTS public._backup_products CASCADE;

-- 백업 테이블 삭제 확인
SELECT
    'Backup tables dropped successfully' as message,
    COUNT(*) as remaining_backup_tables
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name LIKE '_backup_%';`;

console.log(dropTableSQL);

console.log('\n\n방법 2: pgAdmin 또는 다른 PostgreSQL 클라이언트 사용');
console.log('----------------------------------------------------');
console.log('연결 정보:');
console.log('- Host: db.xrtldeesmhmempfafcsm.supabase.co');
console.log('- Database: postgres');
console.log('- Port: 5432');
console.log('- User: postgres');
console.log('- Password: [Supabase 대시보드에서 확인]');
console.log('\n위 SQL을 실행하세요.\n');

// 테이블 존재 여부 확인을 위한 쿼리
console.log('\n테이블 삭제 전 확인용 SQL:');
console.log('------------------------');
console.log(`-- 백업 테이블 목록 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name LIKE '_backup_%'
ORDER BY table_name;`);

console.log('\n=====================================');
console.log('중요: 백업 테이블 삭제 후 git에 변경사항을 커밋하세요.');
console.log('=====================================');