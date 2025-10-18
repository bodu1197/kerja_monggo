-- =============================================
-- 구인구직 플랫폼 전환 마이그레이션
-- KerjaMonggo (Job Board Platform)
-- =============================================

-- 기존 products 관련 테이블 백업 (나중에 복원 가능하도록)
-- DROP 대신 이름 변경으로 보존
ALTER TABLE IF EXISTS products RENAME TO _backup_products;
ALTER TABLE IF EXISTS product_images RENAME TO _backup_product_images;
ALTER TABLE IF EXISTS product_comments RENAME TO _backup_product_comments;
ALTER TABLE IF EXISTS favorites RENAME TO _backup_favorites;
ALTER TABLE IF EXISTS view_history RENAME TO _backup_view_history;
ALTER TABLE IF EXISTS trash_products RENAME TO _backup_trash_products;

-- =============================================
-- 1. ENUM TYPES (열거형 타입)
-- =============================================

-- 고용 형태
CREATE TYPE employment_type AS ENUM (
  'full_time',      -- 풀타임
  'part_time',      -- 파트타임
  'contract',       -- 계약직
  'internship',     -- 인턴십
  'freelance'       -- 프리랜서
);

-- 경력 수준
CREATE TYPE experience_level AS ENUM (
  'entry',          -- 신입
  'junior',         -- 주니어 (1-3년)
  'mid',            -- 중급 (3-5년)
  'senior',         -- 시니어 (5-10년)
  'lead',           -- 리드 (10년+)
  'executive'       -- 임원급
);

-- 채용공고 상태
CREATE TYPE job_status AS ENUM (
  'draft',          -- 임시저장
  'active',         -- 활성화 (모집중)
  'paused',         -- 일시중지
  'closed',         -- 마감
  'filled'          -- 채용완료
);

-- 지원 상태
CREATE TYPE application_status AS ENUM (
  'pending',        -- 검토 중
  'reviewed',       -- 검토 완료
  'shortlisted',    -- 서류 합격
  'interviewed',    -- 면접 완료
  'offered',        -- 최종 합격
  'rejected',       -- 불합격
  'withdrawn'       -- 지원 취소
);

-- 학력
CREATE TYPE education_level AS ENUM (
  'sma',            -- SMA/SMK (고등학교)
  'd3',             -- D3 (전문학사)
  's1',             -- S1 (학사)
  's2',             -- S2 (석사)
  's3'              -- S3 (박사)
);

-- =============================================
-- 2. COMPANIES TABLE (기업 정보)
-- =============================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 기본 정보
  company_name VARCHAR(200) NOT NULL,
  business_registration VARCHAR(50), -- NPWP/NIB
  industry VARCHAR(100),              -- 업종
  company_size VARCHAR(50),           -- 회사 규모: 1-10, 11-50, 51-200, 201-500, 500+

  -- 연락처
  email VARCHAR(255),
  phone VARCHAR(15),
  website VARCHAR(255),

  -- 주소
  address TEXT,
  province_id INTEGER REFERENCES provinces(province_id),
  regency_id INTEGER REFERENCES regencies(regency_id),

  -- 미디어
  logo_url TEXT,
  cover_image_url TEXT,

  -- 소개
  description TEXT,
  benefits TEXT[],                    -- 복리후생 (배열)

  -- 검증
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT business_registration_format CHECK (
    business_registration IS NULL OR
    length(business_registration) >= 10
  )
);

CREATE INDEX idx_companies_user ON companies(user_id);
CREATE INDEX idx_companies_verified ON companies(is_verified);
CREATE INDEX idx_companies_regency ON companies(regency_id);

COMMENT ON TABLE companies IS '기업 정보 테이블';
COMMENT ON COLUMN companies.business_registration IS 'NPWP 또는 NIB (사업자등록번호)';
COMMENT ON COLUMN companies.benefits IS '복리후생 목록 (BPJS, 보험, 식대 등)';

-- =============================================
-- 3. JOBS TABLE (채용공고)
-- =============================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- 기본 정보
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,           -- 자격 요건
  responsibilities TEXT,                -- 담당 업무

  -- 고용 조건
  employment_type employment_type NOT NULL,
  experience_level experience_level NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(3) DEFAULT 'IDR',
  is_salary_negotiable BOOLEAN DEFAULT false,

  -- 근무지
  province_id INTEGER REFERENCES provinces(province_id),
  regency_id INTEGER REFERENCES regencies(regency_id),
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  is_remote BOOLEAN DEFAULT false,

  -- 카테고리 및 태그
  category_id INTEGER REFERENCES categories(category_id),
  skills TEXT[],                        -- 필요 기술 (배열)

  -- 복리후생
  benefits TEXT[],

  -- 모집 정보
  positions_available INTEGER DEFAULT 1,
  deadline TIMESTAMPTZ,

  -- 상태
  status job_status DEFAULT 'draft',

  -- 조회수
  view_count INTEGER DEFAULT 0,

  -- 검색용
  search_vector TSVECTOR,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,               -- 자동 만료

  CONSTRAINT salary_range_check CHECK (
    salary_min IS NULL OR
    salary_max IS NULL OR
    salary_min <= salary_max
  ),
  CONSTRAINT title_length CHECK (length(title) >= 5 AND length(title) <= 200),
  CONSTRAINT description_length CHECK (length(description) >= 50)
);

-- 인덱스
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category_id);
CREATE INDEX idx_jobs_regency ON jobs(regency_id);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX idx_jobs_deadline ON jobs(deadline);
CREATE INDEX idx_jobs_location ON jobs(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_jobs_search ON jobs USING GIN(search_vector);
CREATE INDEX idx_jobs_active ON jobs(status, deadline)
  WHERE status = 'active';

COMMENT ON TABLE jobs IS '채용공고 테이블';
COMMENT ON COLUMN jobs.skills IS '필요 기술 목록 (React, Node.js, etc.)';
COMMENT ON COLUMN jobs.is_remote IS '원격 근무 가능 여부';

-- =============================================
-- 4. CANDIDATE PROFILES (구직자 프로필)
-- =============================================

CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 기본 정보
  full_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),

  -- 연락처
  email VARCHAR(255),
  phone VARCHAR(15),

  -- 위치
  province_id INTEGER REFERENCES provinces(province_id),
  regency_id INTEGER REFERENCES regencies(regency_id),

  -- 직무 정보
  current_title VARCHAR(100),
  experience_level experience_level,
  expected_salary_min INTEGER,
  expected_salary_max INTEGER,

  -- 기술 및 학력
  skills TEXT[],
  education_level education_level,

  -- 이력서
  resume_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,

  -- 자기소개
  bio TEXT,

  -- 프라이버시 설정
  is_profile_public BOOLEAN DEFAULT true,
  is_open_to_work BOOLEAN DEFAULT true,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_candidates_user ON candidate_profiles(user_id);
CREATE INDEX idx_candidates_regency ON candidate_profiles(regency_id);
CREATE INDEX idx_candidates_experience ON candidate_profiles(experience_level);
CREATE INDEX idx_candidates_open_to_work ON candidate_profiles(is_open_to_work);

COMMENT ON TABLE candidate_profiles IS '구직자 프로필';
COMMENT ON COLUMN candidate_profiles.is_open_to_work IS '구직 중 여부';

-- =============================================
-- 5. EDUCATION (학력)
-- =============================================

CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,

  institution VARCHAR(200) NOT NULL,    -- 학교명
  degree education_level NOT NULL,      -- 학위
  field_of_study VARCHAR(100),          -- 전공
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_education_candidate ON education(candidate_id);

COMMENT ON TABLE education IS '구직자 학력 정보';

-- =============================================
-- 6. WORK EXPERIENCE (경력)
-- =============================================

CREATE TABLE work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,

  company_name VARCHAR(200) NOT NULL,
  job_title VARCHAR(100) NOT NULL,
  employment_type employment_type,
  location VARCHAR(100),

  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,

  description TEXT,
  achievements TEXT[],

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_work_experience_candidate ON work_experience(candidate_id);
CREATE INDEX idx_work_experience_current ON work_experience(is_current);

COMMENT ON TABLE work_experience IS '구직자 경력 정보';

-- =============================================
-- 7. CERTIFICATIONS (자격증)
-- =============================================

CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,

  name VARCHAR(200) NOT NULL,
  issuing_organization VARCHAR(200),
  issue_date DATE,
  expiry_date DATE,
  credential_id VARCHAR(100),
  credential_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_certifications_candidate ON certifications(candidate_id);

COMMENT ON TABLE certifications IS '자격증 및 인증서';

-- =============================================
-- 8. APPLICATIONS (지원 내역)
-- =============================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,

  -- 지원 정보
  resume_url TEXT NOT NULL,
  cover_letter TEXT,
  status application_status DEFAULT 'pending',

  -- 추가 정보
  expected_salary INTEGER,
  available_start_date DATE,

  -- 기업 피드백
  employer_notes TEXT,

  -- 타임스탬프
  applied_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,

  -- 중복 지원 방지
  UNIQUE(job_id, candidate_id)
);

CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_date ON applications(applied_at DESC);

COMMENT ON TABLE applications IS '채용 지원 내역';
COMMENT ON COLUMN applications.employer_notes IS '기업 측 메모 (구직자에게 비공개)';

-- =============================================
-- 9. SAVED JOBS (관심 공고)
-- =============================================

CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, job_id)
);

CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_id, created_at DESC);
CREATE INDEX idx_saved_jobs_job ON saved_jobs(job_id);

COMMENT ON TABLE saved_jobs IS '관심 채용공고 (찜)';

-- =============================================
-- 10. JOB VIEWS (조회 기록)
-- =============================================

CREATE TABLE job_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  viewed_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(job_id, user_id)
);

CREATE INDEX idx_job_views_job ON job_views(job_id);
CREATE INDEX idx_job_views_user ON job_views(user_id, viewed_at DESC);

COMMENT ON TABLE job_views IS '채용공고 조회 기록';

-- =============================================
-- 11. PROFILES 테이블 업데이트 (role 확장)
-- =============================================

-- 기존 CHECK CONSTRAINT 제거 및 새로운 role 값 추가
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (
  (role::text = ANY (ARRAY[
    'user'::character varying::text,
    'admin'::character varying::text,
    'moderator'::character varying::text,
    'job_seeker'::character varying::text,
    'employer'::character varying::text
  ]))
);

-- 주석 업데이트
COMMENT ON TABLE profiles IS '사용자 프로필 (구직자 및 기업 공통)';
COMMENT ON COLUMN profiles.role IS 'user, admin, moderator, job_seeker, employer';

-- =============================================
-- 12. CATEGORIES 유지 (기존 데이터 그대로 사용)
-- =============================================

-- 기존 categories 테이블 데이터를 그대로 사용합니다.
-- 필요시 Supabase Dashboard에서 직접 업종 카테고리로 수정하세요.

COMMENT ON TABLE categories IS '업종 카테고리 (기존 데이터 유지)';

-- =============================================
-- 13. FUNCTIONS
-- =============================================

-- 채용공고 검색 벡터 업데이트
CREATE OR REPLACE FUNCTION jobs_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('indonesian',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(array_to_string(NEW.skills, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER jobs_search_vector_trigger
  BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION jobs_search_vector_update();

-- 채용공고 만료일 설정 (30일 후)
CREATE OR REPLACE FUNCTION set_job_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NEW.created_at + INTERVAL '30 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_job_expiry
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_job_expiry();

-- updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 주변 채용공고 검색 (위치 기반)
CREATE OR REPLACE FUNCTION nearby_jobs(
  user_lat NUMERIC,
  user_lng NUMERIC,
  max_distance_km INTEGER DEFAULT 50,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  company_name VARCHAR,
  employment_type employment_type,
  salary_min INTEGER,
  salary_max INTEGER,
  regency_name VARCHAR,
  distance_km NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.title,
    c.company_name,
    j.employment_type,
    j.salary_min,
    j.salary_max,
    r.regency_name,
    (6371 * acos(
      cos(radians(user_lat)) *
      cos(radians(j.latitude)) *
      cos(radians(j.longitude) - radians(user_lng)) +
      sin(radians(user_lat)) *
      sin(radians(j.latitude))
    ))::DECIMAL AS distance_km
  FROM jobs j
  JOIN companies c ON j.company_id = c.id
  LEFT JOIN regencies r ON j.regency_id = r.regency_id
  WHERE
    j.status = 'active'
    AND j.latitude IS NOT NULL
    AND j.longitude IS NOT NULL
    AND (6371 * acos(
      cos(radians(user_lat)) *
      cos(radians(j.latitude)) *
      cos(radians(j.longitude) - radians(user_lng)) +
      sin(radians(user_lat)) *
      sin(radians(j.latitude))
    )) <= max_distance_km
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 채용공고 검색
CREATE OR REPLACE FUNCTION search_jobs(
  search_query TEXT,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  company_name VARCHAR,
  employment_type employment_type,
  salary_min INTEGER,
  salary_max INTEGER,
  regency_name VARCHAR,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.title,
    c.company_name,
    j.employment_type,
    j.salary_min,
    j.salary_max,
    r.regency_name,
    ts_rank(j.search_vector, to_tsquery('indonesian', search_query)) as rank
  FROM jobs j
  JOIN companies c ON j.company_id = c.id
  LEFT JOIN regencies r ON j.regency_id = r.regency_id
  WHERE j.search_vector @@ to_tsquery('indonesian', search_query)
    AND j.status = 'active'
  ORDER BY rank DESC, j.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 14. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies viewable by everyone"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own company"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);

-- Jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs viewable by everyone"
  ON jobs FOR SELECT
  USING (status = 'active' OR
         EXISTS (SELECT 1 FROM companies WHERE companies.id = jobs.company_id AND companies.user_id = auth.uid()) OR
         is_admin());

CREATE POLICY "Company owners can insert jobs"
  ON jobs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM companies WHERE companies.id = jobs.company_id AND companies.user_id = auth.uid()));

CREATE POLICY "Company owners can update jobs"
  ON jobs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = jobs.company_id AND companies.user_id = auth.uid()));

CREATE POLICY "Company owners can delete jobs"
  ON jobs FOR DELETE
  USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = jobs.company_id AND companies.user_id = auth.uid()));

-- Candidate Profiles
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates viewable if public or own"
  ON candidate_profiles FOR SELECT
  USING (is_profile_public = true OR auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own candidate profile"
  ON candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own candidate profile"
  ON candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Education
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Education viewable by owner or admins"
  ON education FOR SELECT
  USING (EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = education.candidate_id AND candidate_profiles.user_id = auth.uid()) OR is_admin());

CREATE POLICY "Users can manage own education"
  ON education FOR ALL
  USING (EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = education.candidate_id AND candidate_profiles.user_id = auth.uid()));

-- Work Experience
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Work experience viewable by owner or admins"
  ON work_experience FOR SELECT
  USING (EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = work_experience.candidate_id AND candidate_profiles.user_id = auth.uid()) OR is_admin());

CREATE POLICY "Users can manage own work experience"
  ON work_experience FOR ALL
  USING (EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = work_experience.candidate_id AND candidate_profiles.user_id = auth.uid()));

-- Certifications
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Certifications viewable by owner or admins"
  ON certifications FOR SELECT
  USING (EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = certifications.candidate_id AND candidate_profiles.user_id = auth.uid()) OR is_admin());

CREATE POLICY "Users can manage own certifications"
  ON certifications FOR ALL
  USING (EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = certifications.candidate_id AND candidate_profiles.user_id = auth.uid()));

-- Applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applications viewable by candidate or employer"
  ON applications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = applications.candidate_id AND candidate_profiles.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = applications.job_id AND c.user_id = auth.uid()) OR
    is_admin()
  );

CREATE POLICY "Candidates can insert applications"
  ON applications FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = applications.candidate_id AND candidate_profiles.user_id = auth.uid()));

CREATE POLICY "Candidates can update own applications"
  ON applications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = applications.candidate_id AND candidate_profiles.user_id = auth.uid()));

CREATE POLICY "Employers can update application status"
  ON applications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = applications.job_id AND c.user_id = auth.uid()));

-- Saved Jobs
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved jobs"
  ON saved_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs"
  ON saved_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved jobs"
  ON saved_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- Job Views
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own job views"
  ON job_views FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Anyone can insert job views"
  ON job_views FOR INSERT
  WITH CHECK (true);

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

COMMENT ON SCHEMA public IS '구인구직 플랫폼 스키마 (Job Board) - 마이그레이션 완료';
