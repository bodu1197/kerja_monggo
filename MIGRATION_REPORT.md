# 📊 구인구직 플랫폼 전환 - 최종 보고서

**프로젝트**: KerjaMonggo (케르자몽고)
**날짜**: 2025-10-18
**작성자**: AI Assistant (Claude)

---

## 📋 요약

### 전환 내용
- **이전**: 상품 판매 플랫폼 (Marketplace)
- **이후**: 구인구직 플랫폼 (Job Board Platform)
- **방식**: 기존 데이터 백업 + 새 스키마 적용

### 주요 성과
✅ 완전한 구인구직 플랫폼 데이터베이스 스키마 설계 완료
✅ 기존 지역 데이터(provinces, regencies) 재사용
✅ 기존 카테고리 데이터 유지 (업종 카테고리로 활용 가능)
✅ 데이터 백업 자동화 (rollback 가능)
✅ Row Level Security (RLS) 완벽 적용
✅ 위치 기반 검색 기능 구현
✅ 인도네시아어 전문검색 지원

---

## 🗂️ 파일 구조

```
C:\Users\ohyus\jobmonggo\
├── supabase/
│   ├── schema.sql                              # 기존 전체 스키마 (백업용)
│   └── migrations/
│       └── 00_job_platform_schema.sql          # 마이그레이션 SQL ✨
├── app/                                         # Next.js 14 App Router
│   ├── page.jsx                                 # 메인 페이지
│   ├── layout.jsx                               # 레이아웃
│   ├── components/                              # 컴포넌트
│   ├── jobs/                                    # 채용공고 페이지
│   └── utils/
│       └── supabase-server.js                   # Supabase 클라이언트
├── package.json                                 # 의존성
├── .env.local                                   # 환경변수
└── MIGRATION_REPORT.md                          # 이 문서 ✨
```

---

## 🎯 데이터베이스 아키텍처

### 새로 생성된 테이블 (9개)

| # | 테이블 | 설명 | 주요 컬럼 |
|---|--------|------|----------|
| 1 | **companies** | 기업 정보 | company_name, business_registration, logo_url, is_verified |
| 2 | **jobs** | 채용공고 | title, description, employment_type, salary_min/max, skills[], deadline |
| 3 | **candidate_profiles** | 구직자 프로필 | full_name, resume_url, skills[], is_open_to_work |
| 4 | **education** | 학력 | institution, degree, field_of_study |
| 5 | **work_experience** | 경력 | company_name, job_title, start_date, end_date |
| 6 | **certifications** | 자격증 | name, issuing_organization, credential_url |
| 7 | **applications** | 지원 내역 | job_id, candidate_id, status, resume_url, cover_letter |
| 8 | **saved_jobs** | 관심 공고 | user_id, job_id (찜) |
| 9 | **job_views** | 조회 기록 | job_id, user_id, viewed_at |

### 재사용 테이블 (9개)

| # | 테이블 | 용도 | 상태 |
|---|--------|------|------|
| 1 | **provinces** | 인도네시아 34개 주 | ✅ 그대로 사용 |
| 2 | **regencies** | 514개 시/군 (위경도 포함) | ✅ 그대로 사용 |
| 3 | **categories** | 업종 카테고리 | ✅ 기존 데이터 유지 |
| 4 | **profiles** | 사용자 프로필 | ⚙️ role에 job_seeker, employer 추가 |
| 5 | **advertisements** | 광고 관리 | ✅ 그대로 사용 |
| 6 | **reports** | 신고 시스템 | ✅ 그대로 사용 |
| 7 | **access_logs** | 접속 로그 | ✅ 그대로 사용 |
| 8 | **push_subscriptions** | 푸시 알림 구독 | ✅ 그대로 사용 |
| 9 | **notification_logs** | 알림 로그 | ✅ 그대로 사용 |

### 백업된 테이블 (6개)

기존 상품 판매 관련 테이블은 `_backup_` 접두사를 붙여 보존:

| 원본 테이블 | 백업 테이블 |
|-----------|-----------|
| products | _backup_products |
| product_images | _backup_product_images |
| product_comments | _backup_product_comments |
| favorites | _backup_favorites |
| view_history | _backup_view_history |
| trash_products | _backup_trash_products |

---

## 🔧 새로운 ENUM 타입 (5개)

### 1. employment_type (고용 형태)
```sql
CREATE TYPE employment_type AS ENUM (
  'full_time',      -- 풀타임
  'part_time',      -- 파트타임
  'contract',       -- 계약직
  'internship',     -- 인턴십
  'freelance'       -- 프리랜서
);
```

### 2. experience_level (경력 수준)
```sql
CREATE TYPE experience_level AS ENUM (
  'entry',          -- 신입
  'junior',         -- 주니어 (1-3년)
  'mid',            -- 중급 (3-5년)
  'senior',         -- 시니어 (5-10년)
  'lead',           -- 리드 (10년+)
  'executive'       -- 임원급
);
```

### 3. job_status (채용공고 상태)
```sql
CREATE TYPE job_status AS ENUM (
  'draft',          -- 임시저장
  'active',         -- 활성화 (모집중)
  'paused',         -- 일시중지
  'closed',         -- 마감
  'filled'          -- 채용완료
);
```

### 4. application_status (지원 상태)
```sql
CREATE TYPE application_status AS ENUM (
  'pending',        -- 검토 중
  'reviewed',       -- 검토 완료
  'shortlisted',    -- 서류 합격
  'interviewed',    -- 면접 완료
  'offered',        -- 최종 합격
  'rejected',       -- 불합격
  'withdrawn'       -- 지원 취소
);
```

### 5. education_level (학력)
```sql
CREATE TYPE education_level AS ENUM (
  'sma',            -- SMA/SMK (고등학교)
  'd3',             -- D3 (전문학사)
  's1',             -- S1 (학사)
  's2',             -- S2 (석사)
  's3'              -- S3 (박사)
);
```

---

## ⚡ 주요 함수 (3개)

### 1. nearby_jobs() - 위치 기반 검색
```sql
SELECT * FROM nearby_jobs(
  -6.2088,      -- 사용자 위도 (Jakarta 예시)
  106.8456,     -- 사용자 경도
  50,           -- 반경 50km
  20            -- 최대 20개 결과
);
```

**반환 컬럼**: id, title, company_name, employment_type, salary_min/max, regency_name, **distance_km**

### 2. search_jobs() - 전문검색
```sql
SELECT * FROM search_jobs(
  'software engineer',  -- 검색어
  50                    -- 최대 50개 결과
);
```

**특징**: 인도네시아어 형태소 분석, 제목/설명/기술스택 통합 검색

### 3. 자동 트리거

| 트리거 | 대상 테이블 | 기능 |
|-------|----------|------|
| jobs_search_vector_trigger | jobs | 검색 벡터 자동 업데이트 |
| trigger_set_job_expiry | jobs | 30일 자동 만료 설정 |
| update_*_updated_at | companies, jobs, candidate_profiles, applications | updated_at 자동 갱신 |

---

## 🔒 Row Level Security (RLS) 정책

모든 테이블에 RLS 적용 완료. 주요 정책:

### Companies (기업)
- ✅ **SELECT**: 모든 사용자 조회 가능
- ✅ **INSERT**: 본인만 생성 가능
- ✅ **UPDATE/DELETE**: 소유자만 가능

### Jobs (채용공고)
- ✅ **SELECT**: `status='active'` 공고는 모두 조회, 비활성은 소유자만
- ✅ **INSERT/UPDATE/DELETE**: 해당 기업 소유자만

### Candidate Profiles (구직자)
- ✅ **SELECT**: `is_profile_public=true`면 모두 조회, 비공개는 본인만
- ✅ **UPDATE**: 본인만 수정

### Applications (지원)
- ✅ **SELECT**: 지원자 본인 + 해당 채용공고 기업
- ✅ **INSERT**: 구직자만 지원 가능
- ✅ **UPDATE**: 지원자는 본인 지원서만, 기업은 상태만 변경

### Education / Work Experience / Certifications
- ✅ 본인만 CRUD 가능

---

## 🚀 마이그레이션 실행 방법

### 옵션 1: Supabase Dashboard (권장)

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택: **zthksbitvezxwhbymatz**
3. **SQL Editor** 클릭
4. `supabase/migrations/00_job_platform_schema.sql` 파일 열기
5. 전체 내용 복사 → 붙여넣기
6. **Run** 클릭
7. ✅ 완료 확인

### 옵션 2: Supabase CLI

```bash
# 프로젝트 디렉토리에서
cd C:\Users\ohyus\jobmonggo

# 마이그레이션 실행
supabase db push

# 또는 직접 실행
supabase db execute -f supabase/migrations/00_job_platform_schema.sql
```

### 실행 후 확인 쿼리

```sql
-- 1. 새 테이블 생성 확인
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('companies', 'jobs', 'candidate_profiles', 'applications')
ORDER BY tablename;
-- 결과: 4개 테이블 나와야 함

-- 2. 백업 테이블 확인
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '_backup_%'
ORDER BY tablename;
-- 결과: 6개 백업 테이블 나와야 함

-- 3. ENUM 타입 확인
SELECT typname FROM pg_type
WHERE typname IN ('employment_type', 'experience_level', 'job_status', 'application_status', 'education_level');
-- 결과: 5개 ENUM 타입

-- 4. 함수 확인
SELECT proname FROM pg_proc
WHERE proname IN ('nearby_jobs', 'search_jobs', 'jobs_search_vector_update');
-- 결과: 3개 함수
```

---

## 📊 ER Diagram (간략)

```
┌─────────────┐
│   profiles  │ (기존 유지)
│   (users)   │
└──────┬──────┘
       │
       ├─────────────────────────────┐
       │                             │
       ▼                             ▼
┌─────────────┐              ┌──────────────────┐
│  companies  │              │ candidate_profiles│
│  (기업)      │              │   (구직자)        │
└──────┬──────┘              └─────┬─────┬──────┘
       │                           │     │
       │ 1:N                       │ 1:N │ 1:N
       │                           │     │
       ▼                           │     │
┌─────────────┐                   │     │
│    jobs     │◄──────────────────┘     │
│  (채용공고)   │                         │
└──────┬──────┘                         │
       │                                 │
       │ N:M                             │
       │                                 │
       ▼                                 │
┌─────────────────┐                     │
│  applications   │◄────────────────────┘
│   (지원내역)      │
└─────────────────┘

추가 테이블:
- education (학력)
- work_experience (경력)
- certifications (자격증)
- saved_jobs (찜)
- job_views (조회 기록)
```

---

## 📈 데이터 통계 (현재 상태)

### 기존 데이터 (보존)
- **provinces**: 34개 주
- **regencies**: 514개 시/군 (위경도 포함)
- **categories**: 기존 데이터 유지 (업종으로 활용 가능)

### 새 데이터 (비어있음)
- companies: 0건
- jobs: 0건
- candidate_profiles: 0건
- applications: 0건

---

## 🔄 롤백 (복원) 방법

만약 문제 발생 시 아래 SQL로 복원:

```sql
-- 1. 새 테이블 전체 삭제
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
DROP TYPE IF EXISTS application_status;
DROP TYPE IF EXISTS job_status;
DROP TYPE IF EXISTS experience_level;
DROP TYPE IF EXISTS employment_type;
DROP TYPE IF EXISTS education_level;

-- 3. 백업에서 복원
ALTER TABLE _backup_products RENAME TO products;
ALTER TABLE _backup_product_images RENAME TO product_images;
ALTER TABLE _backup_product_comments RENAME TO product_comments;
ALTER TABLE _backup_favorites RENAME TO favorites;
ALTER TABLE _backup_view_history RENAME TO view_history;
ALTER TABLE _backup_trash_products RENAME TO trash_products;
```

---

## 🎨 Next.js 통합 계획

### 1단계: 데이터 타입 정의 (TypeScript)

`types/database.types.ts` 생성:

```typescript
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed' | 'filled';
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected' | 'withdrawn';
export type EducationLevel = 'sma' | 'd3' | 's1' | 's2' | 's3';

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  regency_id?: number;
  category_id?: number;
  skills?: string[];
  status: JobStatus;
  created_at: string;
  deadline?: string;
}

export interface Company {
  id: string;
  company_name: string;
  logo_url?: string;
  description?: string;
  is_verified: boolean;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  resume_url: string;
  cover_letter?: string;
  applied_at: string;
}
```

### 2단계: Supabase 클라이언트 함수

`lib/supabase/jobs.ts`:

```typescript
import { createClient } from '@/utils/supabase-server';

export async function getActiveJobs(limit = 20) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      companies (
        company_name,
        logo_url,
        is_verified
      ),
      regencies (
        regency_name
      ),
      categories (
        name
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function searchJobs(query: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .rpc('search_jobs', {
      search_query: query,
      limit_count: 50
    });

  if (error) throw error;
  return data;
}

export async function getNearbyJobs(lat: number, lng: number, distance = 50) {
  const supabase = createClient();

  const { data, error } = await supabase
    .rpc('nearby_jobs', {
      user_lat: lat,
      user_lng: lng,
      max_distance_km: distance,
      limit_count: 50
    });

  if (error) throw error;
  return data;
}
```

### 3단계: 페이지 구조

```
app/
├── (home)/
│   └── page.tsx                    # 메인 페이지 (검색, 최신 공고)
├── jobs/
│   ├── page.tsx                    # 채용공고 목록
│   ├── [id]/
│   │   └── page.tsx                # 채용공고 상세
│   └── create/
│       └── page.tsx                # 채용공고 등록 (기업 전용)
├── companies/
│   ├── page.tsx                    # 기업 목록
│   ├── [id]/
│   │   └── page.tsx                # 기업 상세
│   └── register/
│       └── page.tsx                # 기업 등록
├── candidates/
│   └── [id]/
│       └── page.tsx                # 구직자 프로필 (공개 프로필만)
├── dashboard/
│   ├── company/
│   │   ├── jobs/                   # 내가 올린 공고 관리
│   │   └── applications/           # 지원자 관리
│   └── candidate/
│       ├── profile/                # 내 프로필 관리
│       ├── applications/           # 내 지원 내역
│       └── saved/                  # 관심 공고
└── auth/
    ├── login/
    └── register/
```

### 4단계: 주요 컴포넌트

**JobCard.tsx** - 채용공고 카드
**CompanyCard.tsx** - 기업 카드
**ApplicationForm.tsx** - 지원 폼
**SearchBar.tsx** - 검색바 (전문검색)
**NearbyJobsButton.tsx** - 내 주변 검색 버튼
**FilterSidebar.tsx** - 필터 (직종, 경력, 급여, 지역 등)

---

## ✅ 완료 체크리스트

### 데이터베이스 마이그레이션
- [x] 기존 스키마 분석
- [x] 새 스키마 설계
- [x] 마이그레이션 SQL 작성
- [x] 백업 전략 수립
- [x] RLS 정책 설계
- [x] 함수 및 트리거 작성
- [ ] **마이그레이션 실행** ← 다음 단계
- [ ] 마이그레이션 검증

### Next.js 통합 (예정)
- [ ] TypeScript 타입 정의
- [ ] Supabase 클라이언트 함수
- [ ] 페이지 구조 재설계
- [ ] 컴포넌트 작성
- [ ] 폼 유효성 검사 (Zod)
- [ ] SEO 최적화 (Metadata API)
- [ ] 성능 최적화 (Image, Font)

---

## 🎯 다음 단계

### 즉시 수행
1. **마이그레이션 실행**
   - Supabase Dashboard에서 SQL 실행
   - 또는 `supabase db push`

2. **마이그레이션 검증**
   - 새 테이블 생성 확인
   - 백업 테이블 확인
   - 함수 작동 테스트

### 단기 (1-2주)
3. **테스트 데이터 입력**
   - 샘플 기업 5-10개
   - 샘플 채용공고 20-30개
   - 샘플 구직자 프로필 10개

4. **Next.js 코드 작성**
   - 타입 정의
   - API 함수
   - 기본 페이지 (메인, 공고 목록, 공고 상세)

### 중기 (3-4주)
5. **핵심 기능 구현**
   - 채용공고 등록/수정/삭제
   - 지원하기
   - 프로필 관리
   - 검색 및 필터

6. **UI/UX 개선**
   - 반응형 디자인
   - 로딩 상태
   - 에러 처리
   - 토스트 알림

### 장기 (1-2개월)
7. **고급 기능**
   - 이메일 알림
   - 푸시 알림
   - 채팅 (실시간 문의)
   - 추천 시스템

8. **배포 및 모니터링**
   - Vercel 배포
   - Google Analytics 설정
   - 성능 모니터링
   - SEO 최적화

---

## 📞 지원 및 문의

### 문서
- **Supabase 문서**: https://supabase.com/docs
- **Next.js 문서**: https://nextjs.org/docs
- **Tailwind CSS 문서**: https://tailwindcss.com/docs

### 이슈 발생 시
1. Supabase Dashboard → Logs 확인
2. Browser DevTools → Console/Network 확인
3. 에러 메시지 복사 후 검색

---

## 📝 변경 이력

| 날짜 | 버전 | 변경사항 |
|-----|------|---------|
| 2025-10-18 | 1.0.0 | 초기 마이그레이션 스키마 작성 |

---

**보고서 작성 완료** ✅
**다음 단계**: 마이그레이션 실행 → 검증 → Next.js 통합

---

**문의**: 추가 질문이나 문제 발생 시 언제든지 알려주세요! 🚀
