-- 기존 마켓플레이스 백업 테이블 삭제 스크립트
-- 이 테이블들은 구인구직 플랫폼에 불필요하므로 완전히 제거합니다

-- 외래키 제약조건이 있을 수 있으므로 CASCADE 옵션 사용
DROP TABLE IF EXISTS public._backup_favorites CASCADE;
DROP TABLE IF EXISTS public._backup_product_comments CASCADE;
DROP TABLE IF EXISTS public._backup_product_images CASCADE;
DROP TABLE IF EXISTS public._backup_view_history CASCADE;
DROP TABLE IF EXISTS public._backup_trash_products CASCADE;
DROP TABLE IF EXISTS public._backup_products CASCADE;

-- 백업 테이블 삭제 확인 메시지
DO $$
BEGIN
    RAISE NOTICE '모든 백업 테이블이 성공적으로 삭제되었습니다.';
END $$;