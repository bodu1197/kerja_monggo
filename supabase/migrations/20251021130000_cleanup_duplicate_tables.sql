-- Migration: Cleanup duplicate and unused tables
-- Date: 2025-10-21
-- Description:
--   1. Unify jobs/job_posts into 'jobs' table
--   2. Use candidate_profiles for job seeker posts (remove job_seeker_posts)
--   3. Remove unused tables: education, work_experience, certifications, applications, saved_jobs, profiles

-- =============================================================================
-- STEP 1: Rename job_posts to jobs (if job_posts exists and jobs doesn't)
-- =============================================================================

-- First, check if we need to migrate data from job_posts to jobs
DO $$
BEGIN
    -- If job_posts exists and jobs doesn't exist, rename it
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'job_posts')
       AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'jobs') THEN
        ALTER TABLE public.job_posts RENAME TO jobs;
        RAISE NOTICE 'Renamed job_posts to jobs';

    -- If both exist, migrate data from job_posts to jobs, then drop job_posts
    ELSIF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'job_posts')
          AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'jobs') THEN

        -- Copy data from job_posts to jobs (only if jobs is empty)
        INSERT INTO public.jobs
        SELECT * FROM public.job_posts
        WHERE NOT EXISTS (SELECT 1 FROM public.jobs);

        -- Drop job_posts table
        DROP TABLE IF EXISTS public.job_posts CASCADE;
        RAISE NOTICE 'Migrated data from job_posts to jobs and dropped job_posts';
    END IF;
END $$;


-- =============================================================================
-- STEP 2: Ensure candidate_profiles has title field
-- =============================================================================

-- Add title field to candidate_profiles if it doesn't exist
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS title character varying(200);

-- Add category_id and subcategory_id if they don't exist (for job seeking preferences)
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS category_id integer REFERENCES public.categories(category_id),
ADD COLUMN IF NOT EXISTS subcategory_id integer REFERENCES public.categories(category_id);

-- Add status field to candidate_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public'
                   AND table_name = 'candidate_profiles'
                   AND column_name = 'status') THEN
        ALTER TABLE public.candidate_profiles
        ADD COLUMN status public.job_status DEFAULT 'active'::public.job_status;
    END IF;
END $$;

COMMENT ON COLUMN public.candidate_profiles.title IS 'Job seeker post title (displayed as bulletin board post)';
COMMENT ON COLUMN public.candidate_profiles.category_id IS 'Desired job category';
COMMENT ON COLUMN public.candidate_profiles.subcategory_id IS 'Desired job subcategory';
COMMENT ON COLUMN public.candidate_profiles.status IS 'Post status (active/paused/closed)';


-- =============================================================================
-- STEP 3: Migrate data from job_seeker_posts to candidate_profiles (if needed)
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'job_seeker_posts') THEN
        -- Update existing candidate_profiles with data from job_seeker_posts
        UPDATE public.candidate_profiles cp
        SET
            title = jsp.title,
            bio = COALESCE(cp.bio, jsp.description),
            province_id = COALESCE(cp.province_id, jsp.province_id),
            regency_id = COALESCE(cp.regency_id, jsp.regency_id),
            category_id = COALESCE(cp.category_id, jsp.category_id),
            subcategory_id = COALESCE(cp.subcategory_id, jsp.subcategory_id),
            status = jsp.status,
            updated_at = jsp.updated_at
        FROM public.job_seeker_posts jsp
        WHERE cp.user_id = jsp.user_id;

        RAISE NOTICE 'Migrated data from job_seeker_posts to candidate_profiles';
    END IF;
END $$;


-- =============================================================================
-- STEP 4: Drop unused and duplicate tables
-- =============================================================================

-- Drop job_seeker_posts (now using candidate_profiles)
DROP TABLE IF EXISTS public.job_seeker_posts CASCADE;

-- Drop unused feature tables
DROP TABLE IF EXISTS public.education CASCADE;
DROP TABLE IF EXISTS public.work_experience CASCADE;
DROP TABLE IF EXISTS public.certifications CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.saved_jobs CASCADE;

-- Drop profiles table (not being used, auth.users is used instead)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop the trigger for profiles if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();


-- =============================================================================
-- STEP 5: Update RLS policies for candidate_profiles
-- =============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Candidate profiles are viewable by everyone." ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can manage their own candidate profile." ON public.candidate_profiles;

-- Create new policies
CREATE POLICY "Active candidate profiles are viewable by everyone."
ON public.candidate_profiles
FOR SELECT
USING (is_profile_public = true AND status = 'active'::public.job_status);

CREATE POLICY "Users can view their own candidate profile."
ON public.candidate_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own candidate profile."
ON public.candidate_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidate profile."
ON public.candidate_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own candidate profile."
ON public.candidate_profiles
FOR DELETE
USING (auth.uid() = user_id);


-- =============================================================================
-- STEP 6: Update table comments
-- =============================================================================

COMMENT ON TABLE public.jobs IS 'Job advertisements posted by companies (unified table)';
COMMENT ON TABLE public.candidate_profiles IS 'Job seeker profiles and posts (combines profile and bulletin board post)';
COMMENT ON TABLE public.companies IS 'Company profiles (simplified)';


-- =============================================================================
-- SUMMARY
-- =============================================================================

-- Tables unified/renamed:
--   ✓ job_posts → jobs
--   ✓ job_seeker_posts → merged into candidate_profiles

-- Tables removed:
--   ✓ profiles
--   ✓ education
--   ✓ work_experience
--   ✓ certifications
--   ✓ applications
--   ✓ saved_jobs
--   ✓ job_seeker_posts

-- Remaining active tables:
--   ✓ provinces, regencies, categories (reference data)
--   ✓ companies (employer info)
--   ✓ jobs (job postings)
--   ✓ candidate_profiles (job seeker profiles + posts)
