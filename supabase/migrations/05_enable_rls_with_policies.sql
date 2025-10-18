-- =============================================
-- RLS 활성화 및 Public Read 정책 설정
-- =============================================

-- Provinces: RLS 활성화 및 정책 설정
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for provinces" ON provinces;
CREATE POLICY "Public Read Access for provinces"
  ON provinces FOR SELECT
  TO public
  USING (true);

-- Regencies: RLS 활성화 및 정책 설정
ALTER TABLE regencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for regencies" ON regencies;
CREATE POLICY "Public Read Access for regencies"
  ON regencies FOR SELECT
  TO public
  USING (true);

-- Categories: RLS 활성화 및 정책 설정
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for categories" ON categories;
CREATE POLICY "Public Read Access for categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Jobs: RLS 활성화 및 정책 설정
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for jobs" ON jobs;
CREATE POLICY "Public Read Access for jobs"
  ON jobs FOR SELECT
  TO public
  USING (status = 'active');

DROP POLICY IF EXISTS "Users can insert their own jobs" ON jobs;
CREATE POLICY "Users can insert their own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
CREATE POLICY "Users can update their own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM companies WHERE id = jobs.company_id))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM companies WHERE id = jobs.company_id));

DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;
CREATE POLICY "Users can delete their own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM companies WHERE id = jobs.company_id));

-- Companies: RLS 활성화 및 정책 설정
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for companies" ON companies;
CREATE POLICY "Public Read Access for companies"
  ON companies FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own company" ON companies;
CREATE POLICY "Users can insert their own company"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own company" ON companies;
CREATE POLICY "Users can update their own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
