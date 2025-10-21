-- Migration: Simplify job posting and candidate profile tables
-- Date: 2025-10-21
-- Description: Remove unnecessary fields from companies, job_posts, and candidate_profiles tables
-- Add title field to candidate_profiles for job seeker post titles

-- =============================================================================
-- 1. COMPANIES TABLE CHANGES
-- =============================================================================

-- Remove business_registration, company_size, and industry from companies table
ALTER TABLE public.companies
DROP COLUMN IF EXISTS business_registration,
DROP COLUMN IF EXISTS company_size,
DROP COLUMN IF EXISTS industry;

COMMENT ON TABLE public.companies IS 'Company profiles created by employers (simplified).';


-- =============================================================================
-- 2. JOB_POSTS TABLE CHANGES
-- =============================================================================

-- Remove requirements (was NOT NULL, so we need to handle existing data)
-- First, update any NULL values if they exist
UPDATE public.job_posts SET requirements = '' WHERE requirements IS NULL;

-- Then drop the column
ALTER TABLE public.job_posts
DROP COLUMN IF EXISTS requirements,
DROP COLUMN IF EXISTS responsibilities,
DROP COLUMN IF EXISTS employment_type,
DROP COLUMN IF EXISTS experience_level,
DROP COLUMN IF EXISTS salary_min,
DROP COLUMN IF EXISTS salary_max,
DROP COLUMN IF EXISTS is_salary_negotiable,
DROP COLUMN IF EXISTS positions_available;

COMMENT ON TABLE public.job_posts IS 'Job advertisements posted by companies (simplified).';


-- =============================================================================
-- 3. JOBS TABLE CHANGES (if exists - backup for table naming inconsistency)
-- =============================================================================

-- Check if 'jobs' table exists separately from 'job_posts'
-- If it does, apply same changes
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'jobs') THEN
        -- Update any NULL values if they exist
        EXECUTE 'UPDATE public.jobs SET requirements = '''' WHERE requirements IS NULL';

        -- Drop columns
        EXECUTE 'ALTER TABLE public.jobs
                 DROP COLUMN IF EXISTS requirements,
                 DROP COLUMN IF EXISTS responsibilities,
                 DROP COLUMN IF EXISTS employment_type,
                 DROP COLUMN IF EXISTS experience_level,
                 DROP COLUMN IF EXISTS salary_min,
                 DROP COLUMN IF EXISTS salary_max,
                 DROP COLUMN IF EXISTS is_salary_negotiable,
                 DROP COLUMN IF EXISTS positions_available';
    END IF;
END $$;


-- =============================================================================
-- 4. CANDIDATE_PROFILES TABLE CHANGES
-- =============================================================================

-- Remove fields: current_title, experience_level, expected_salary_min, expected_salary_max, skills
ALTER TABLE public.candidate_profiles
DROP COLUMN IF EXISTS current_title,
DROP COLUMN IF EXISTS experience_level,
DROP COLUMN IF EXISTS expected_salary_min,
DROP COLUMN IF EXISTS expected_salary_max,
DROP COLUMN IF EXISTS skills;

-- Add title field for job seeker post title (like a bulletin board post)
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS title character varying(200);

COMMENT ON COLUMN public.candidate_profiles.title IS 'Job seeker post title (e.g., "Passionate developer seeking opportunities")';
COMMENT ON TABLE public.candidate_profiles IS 'Detailed profiles for job seekers (simplified).';


-- =============================================================================
-- 5. UPDATE CATEGORY_ID FIELD COMMENT (for clarity)
-- =============================================================================

-- Update comments to reflect that province_id and regency_id in candidate_profiles
-- now represent desired work location, not current residence
COMMENT ON COLUMN public.candidate_profiles.province_id IS 'Desired work location - province';
COMMENT ON COLUMN public.candidate_profiles.regency_id IS 'Desired work location - regency';


-- =============================================================================
-- 6. CLEANUP UNUSED ENUM TYPES (if no longer referenced)
-- =============================================================================

-- Note: employment_type and experience_level ENUMs might still be used in other tables
-- (work_experience table uses employment_type)
-- So we'll keep them for now. If you want to remove them later, ensure no tables reference them.

-- To check which tables still use these types:
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE udt_name IN ('employment_type', 'experience_level');
