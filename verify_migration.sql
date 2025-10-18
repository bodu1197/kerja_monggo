-- =============================================
-- 마이그레이션 검증 SQL
-- Supabase Dashboard → SQL Editor에서 실행
-- =============================================

-- 1. 새로 생성된 테이블 확인 (9개 예상)
SELECT '=== 새 테이블 (9개 예상) ===' as section;
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'companies',
    'jobs',
    'candidate_profiles',
    'education',
    'work_experience',
    'certifications',
    'applications',
    'saved_jobs',
    'job_views'
  )
ORDER BY tablename;

-- 2. 백업된 테이블 확인 (6개 예상)
SELECT '=== 백업 테이블 (6개 예상) ===' as section;
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '_backup_%'
ORDER BY tablename;

-- 3. 재사용 테이블 확인 (provinces, regencies, categories, profiles)
SELECT '=== 재사용 테이블 (4개 예상) ===' as section;
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('provinces', 'regencies', 'categories', 'profiles')
ORDER BY tablename;

-- 4. ENUM 타입 확인 (5개 예상)
SELECT '=== ENUM 타입 (5개 예상) ===' as section;
SELECT typname
FROM pg_type
WHERE typname IN (
  'employment_type',
  'experience_level',
  'job_status',
  'application_status',
  'education_level'
)
ORDER BY typname;

-- 5. 주요 함수 확인 (3개 예상)
SELECT '=== 주요 함수 (3개 예상) ===' as section;
SELECT proname
FROM pg_proc
WHERE proname IN (
  'nearby_jobs',
  'search_jobs',
  'jobs_search_vector_update'
)
ORDER BY proname;

-- 6. RLS 정책 확인
SELECT '=== RLS 정책 ===' as section;
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('companies', 'jobs', 'candidate_profiles', 'applications')
GROUP BY tablename
ORDER BY tablename;

-- 7. profiles 테이블 role CHECK 제약 확인
SELECT '=== profiles role 제약 ===' as section;
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND conname = 'profiles_role_check';

-- 8. 전체 테이블 개수 (public 스키마)
SELECT '=== 전체 테이블 개수 ===' as section;
SELECT COUNT(*) as total_tables
FROM pg_tables
WHERE schemaname = 'public';

-- 9. 외래 키 제약 확인
SELECT '=== 외래 키 제약 (주요 테이블) ===' as section;
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('jobs', 'applications', 'candidate_profiles')
ORDER BY tc.table_name, kcu.column_name;

-- 10. 인덱스 확인 (주요 테이블)
SELECT '=== 인덱스 (jobs 테이블) ===' as section;
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'jobs'
  AND schemaname = 'public'
ORDER BY indexname;

-- =============================================
-- 마이그레이션 성공 기준:
-- ✅ 새 테이블: 9개
-- ✅ 백업 테이블: 6개
-- ✅ ENUM 타입: 5개
-- ✅ 주요 함수: 3개
-- ✅ RLS 정책: 각 테이블당 최소 2-3개
-- =============================================
