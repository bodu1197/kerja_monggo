# Supabase 데이터 삽입 가이드

provinces, regencies, categories 데이터를 Supabase에 삽입하는 방법입니다.

## 방법 1: Supabase 대시보드에서 직접 실행 (권장)

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택: `ffcksakokpunfhlvgigw`
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. 아래 파일들의 내용을 순서대로 복사하여 실행:

   a. `supabase/migrations/20251020000001_insert_location_data.sql`
   - 38개의 인도네시아 provinces 삽입

   b. `supabase/migrations/20251020000002_insert_regencies_data.sql`
   - 514개의 regencies (시/군) 삽입

   c. `supabase/migrations/20251020000003_insert_categories_data.sql`
   - 18개의 1차 직업 카테고리
   - 140개의 2차 직업 카테고리 (총 158개)

5. 각 SQL을 붙여넣고 **Run** 버튼 클릭

## 방법 2: Supabase CLI 사용

먼저 Supabase 프로젝트에 링크:

```bash
npx supabase link --project-ref ffcksakokpunfhlvgigw
```

데이터베이스 비밀번호 입력 후:

```bash
npx supabase db push
```

## 데이터 확인

삽입 후 다음 쿼리로 데이터를 확인할 수 있습니다:

```sql
-- Provinces 개수 확인
SELECT COUNT(*) FROM provinces;
-- 결과: 38

-- Regencies 개수 확인
SELECT COUNT(*) FROM regencies;
-- 결과: 514

-- Categories 개수 확인
SELECT COUNT(*) FROM categories;
-- 결과: 158 (1차: 18개, 2차: 140개)

-- Province별 Regency 개수
SELECT
  p.province_name,
  COUNT(r.regency_id) as regency_count
FROM provinces p
LEFT JOIN regencies r ON p.province_id = r.province_id
GROUP BY p.province_id, p.province_name
ORDER BY p.province_id;

-- 1차 카테고리와 하위 카테고리 개수
SELECT
  c1.name as category,
  c1.icon,
  COUNT(c2.category_id) as subcategory_count
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_category = c1.name
WHERE c1.parent_category IS NULL
GROUP BY c1.category_id, c1.name, c1.icon
ORDER BY c1.category_id;
```

## 직업 카테고리 목록

### 1차 카테고리 (18개):

1. 💻 **IT & Software** - 13개 하위 카테고리
2. 📈 **Marketing & Sales** - 11개 하위 카테고리
3. 🎨 **Design & Creative** - 8개 하위 카테고리
4. 🎧 **Customer Service** - 6개 하위 카테고리
5. 💰 **Finance & Accounting** - 7개 하위 카테고리
6. 👥 **Human Resources** - 6개 하위 카테고리
7. 📚 **Education & Training** - 6개 하위 카테고리
8. ⚕️ **Healthcare & Medical** - 8개 하위 카테고리
9. ⚙️ **Engineering** - 7개 하위 카테고리
10. 🏭 **Manufacturing & Production** - 6개 하위 카테고리
11. 🚚 **Logistics & Supply Chain** - 6개 하위 카테고리
12. 🍽️ **Hospitality & Food Service** - 8개 하위 카테고리
13. 🏗️ **Construction & Architecture** - 19개 하위 카테고리 (벽돌공, 미장공, 타일공 등 포함)
14. ⚖️ **Legal & Compliance** - 5개 하위 카테고리
15. 📺 **Media & Communications** - 7개 하위 카테고리
16. 📁 **Administrative & Office Support** - 6개 하위 카테고리
17. 🌾 **Agriculture & Farming** - 5개 하위 카테고리
18. 📌 **Others** - 6개 하위 카테고리

## 파일 정보

- **20251020000001_insert_location_data.sql**: Province 데이터 (38 rows)
- **20251020000002_insert_regencies_data.sql**: Regency 데이터 (514 rows)
- **20251020000003_insert_categories_data.sql**: 직업 카테고리 데이터 (158 rows)

모든 INSERT 문은 `ON CONFLICT DO NOTHING`을 사용하여 중복 데이터를 방지합니다.
