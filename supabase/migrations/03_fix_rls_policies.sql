-- =============================================
-- RLS 정책 수정 및 활성화
-- =============================================

-- Provinces
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for provinces" ON provinces;
CREATE POLICY "Public Read Access for provinces"
  ON provinces FOR SELECT
  USING (true);

-- Regencies
ALTER TABLE regencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for regencies" ON regencies;
CREATE POLICY "Public Read Access for regencies"
  ON regencies FOR SELECT
  USING (true);

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for categories" ON categories;
CREATE POLICY "Public Read Access for categories"
  ON categories FOR SELECT
  USING (true);
