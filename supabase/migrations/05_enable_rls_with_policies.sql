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
