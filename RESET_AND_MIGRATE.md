# 🔄 마이그레이션 초기화 및 재실행 가이드

## 📋 현재 상황

**문제**: 로컬과 원격 마이그레이션 이력이 불일치
- **로컬**: `00_job_platform_schema.sql` 1개만 존재
- **원격**: 이전 마이그레이션 20개 이상 존재

**해결책**: 양쪽 모두 초기화 후 새로 시작

---

## ✅ 방법 1: Supabase Dashboard 사용 (가장 안전, 추천)

### 단계별 실행

#### 1단계: Supabase Dashboard 접속
```
https://supabase.com/dashboard
→ 프로젝트 선택: zthksbitvezxwhbymatz
→ SQL Editor 클릭
```

#### 2단계: 마이그레이션 테이블 초기화 (선택사항)
```sql
-- 기존 마이그레이션 히스토리 확인
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC;

-- 선택: 전체 초기화 (주의!)
-- TRUNCATE TABLE supabase_migrations.schema_migrations;
```

#### 3단계: 새 스키마 실행
1. 파일 열기: `C:\Users\ohyus\jobmonggo\supabase\migrations\00_job_platform_schema.sql`
2. 전체 내용 복사
3. SQL Editor에 붙여넣기
4. **Run** 버튼 클릭
5. ✅ 성공 메시지 확인

#### 4단계: 검증
```sql
-- 새 테이블 확인
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('companies', 'jobs', 'candidate_profiles', 'applications')
ORDER BY tablename;
-- 결과: 4개 테이블

-- 백업 테이블 확인
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '_backup_%'
ORDER BY tablename;
-- 결과: 6개 백업 테이블
```

---

## 🔧 방법 2: Supabase CLI 사용 (고급)

### 단계별 실행

#### 1단계: 원격 데이터베이스 리셋 (매우 주의!)

```bash
# ⚠️ 경고: 이 명령은 원격 데이터베이스의 모든 데이터를 삭제합니다!
# 백업이 있는지 확인하세요!

# 원격 DB를 로컬 마이그레이션 상태로 리셋
supabase db reset --linked
```

#### 2단계: 새 마이그레이션 푸시

```bash
# 로컬 마이그레이션을 원격에 적용
supabase db push
```

#### 3단계: 검증

```bash
# 원격 DB 상태 확인
supabase db diff

# 마이그레이션 이력 확인
supabase migration list
```

---

## 🎯 방법 3: 마이그레이션 히스토리만 수정 (가장 빠름)

원격 DB 데이터를 유지하면서 마이그레이션 히스토리만 정리:

### 단계별 실행

#### 1단계: 기존 마이그레이션을 "완료됨"으로 표시

```bash
# 원격의 모든 미완료 마이그레이션을 reverted 상태로 설정
supabase migration repair --status reverted \
  20251011211807 20251011220313 20251011220537 \
  20251012000001 20251012000002 20251012000003 \
  20251012000004 20251012000005 20251012000006 \
  20251012000007 20251012000008 20251012000009 \
  20251012000010 20251013 20251014000001 \
  20251014000002 20251014000003 20251014000004 \
  20251014000005 20251014000006 20251014000007 \
  20251014000008 20251014212919 20251015000001 \
  20251015000002 20251015000003 20251015000004
```

#### 2단계: 로컬과 원격 동기화

```bash
# 원격 스키마를 로컬로 pull
supabase db pull

# 또는 원격 마이그레이션 파일들을 로컬에 다운로드
# (supabase/migrations/ 폴더에 추가됨)
```

#### 3단계: 새 마이그레이션 적용

```bash
# 이제 우리의 새 마이그레이션을 push
supabase db push
```

---

## 🚀 추천 방법

**초보자 또는 안전 우선**: 방법 1 (Dashboard)
**경험자 또는 빠른 테스트**: 방법 3 (히스토리 수정)
**완전 새로 시작**: 방법 2 (DB 리셋)

---

## ⚠️ 주의사항

### 데이터 손실 위험

| 방법 | 데이터 삭제 | 안전성 | 속도 |
|-----|----------|--------|-----|
| 방법 1 (Dashboard) | ❌ 없음 | ✅✅✅ 가장 안전 | 중간 |
| 방법 2 (DB Reset) | ⚠️ 전체 삭제 | ❌ 위험 | 빠름 |
| 방법 3 (히스토리 수정) | ❌ 없음 | ✅✅ 안전 | 가장 빠름 |

### 백업 확인

리셋 전에 반드시 확인:

```bash
# 현재 데이터베이스 덤프
supabase db dump -f backup_$(date +%Y%m%d).sql

# Supabase Dashboard에서 수동 백업 생성
Dashboard → Database → Backups → Create Backup
```

---

## 🎬 실행 예시

### 방법 1 사용 (Dashboard)

```
1. 브라우저 열기
   https://supabase.com/dashboard

2. SQL Editor 열기

3. 파일 내용 복사
   C:\Users\ohyus\jobmonggo\supabase\migrations\00_job_platform_schema.sql

4. 붙여넣기 → Run

5. 완료! ✅
```

### 방법 3 사용 (CLI - 빠름)

```bash
cd C:\Users\ohyus\jobmonggo

# 1. 기존 마이그레이션 reverted 처리
supabase migration repair --status reverted 20251011211807 20251011220313 20251011220537 20251012000001 20251012000002 20251012000003 20251012000004 20251012000005 20251012000006 20251012000007 20251012000008 20251012000009 20251012000010 20251013 20251014000001 20251014000002 20251014000003 20251014000004 20251014000005 20251014000006 20251014000007 20251014000008 20251014212919 20251015000001 20251015000002 20251015000003 20251015000004

# 2. 새 마이그레이션 푸시
supabase db push

# 3. 완료! ✅
```

---

## ✅ 완료 후 확인

마이그레이션 완료 후 다음 SQL로 검증:

```sql
-- 1. 새 테이블 (9개)
SELECT COUNT(*) as new_tables
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'companies', 'jobs', 'candidate_profiles',
    'education', 'work_experience', 'certifications',
    'applications', 'saved_jobs', 'job_views'
  );
-- 결과: 9

-- 2. 백업 테이블 (6개)
SELECT COUNT(*) as backup_tables
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '_backup_%';
-- 결과: 6

-- 3. 재사용 테이블 확인
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('provinces', 'regencies', 'categories', 'profiles')
ORDER BY tablename;
-- 결과: 4개 (provinces, regencies, categories, profiles)

-- 4. ENUM 타입 (5개)
SELECT COUNT(*) as enum_types
FROM pg_type
WHERE typname IN (
  'employment_type', 'experience_level', 'job_status',
  'application_status', 'education_level'
);
-- 결과: 5

-- 5. 주요 함수 (3개)
SELECT COUNT(*) as functions
FROM pg_proc
WHERE proname IN ('nearby_jobs', 'search_jobs', 'jobs_search_vector_update');
-- 결과: 3
```

모든 숫자가 맞으면 **마이그레이션 성공!** ✅

---

## 🔄 롤백 방법

만약 문제가 생기면:

```sql
-- 1. 새 테이블 모두 삭제
DROP TABLE IF EXISTS job_views CASCADE;
DROP TABLE IF EXISTS saved_jobs CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS work_experience CASCADE;
DROP TABLE IF EXISTS education CASCADE;
DROP TABLE IF EXISTS candidate_profiles CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- 2. ENUM 타입 삭제
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS experience_level CASCADE;
DROP TYPE IF EXISTS employment_type CASCADE;
DROP TYPE IF EXISTS education_level CASCADE;

-- 3. 백업에서 복원
ALTER TABLE _backup_products RENAME TO products;
ALTER TABLE _backup_product_images RENAME TO product_images;
ALTER TABLE _backup_product_comments RENAME TO product_comments;
ALTER TABLE _backup_favorites RENAME TO favorites;
ALTER TABLE _backup_view_history RENAME TO view_history;
ALTER TABLE _backup_trash_products RENAME TO trash_products;
```

---

## 📞 도움말

### 에러 발생 시

**"permission denied" 에러**
→ Supabase Dashboard에서 실행하세요

**"relation already exists" 에러**
→ 해당 테이블이 이미 있습니다. DROP 후 재실행

**"type already exists" 에러**
→ 해당 ENUM이 이미 있습니다. DROP TYPE 후 재실행

**마이그레이션 히스토리 충돌**
→ 방법 3의 `migration repair` 사용

---

**작성일**: 2025-10-18
**상태**: Ready to Execute
**추천**: 방법 1 (Supabase Dashboard) 또는 방법 3 (migration repair)
