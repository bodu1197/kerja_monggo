# 직업 카테고리 데이터 삽입 가이드

## Supabase 대시보드에서 삽입하기

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택: `ffcksakokpunfhlvgigw`
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. `supabase/migrations/20251020000003_insert_categories_data.sql` 파일의 내용을 복사
5. SQL Editor에 붙여넣고 **Run** 클릭

## 삽입되는 데이터

- **총 158개의 직업 카테고리**
  - 1차 카테고리: 18개
  - 2차 카테고리: 140개

## 1차 카테고리 목록 (18개)

| ID | 카테고리 | 하위 카테고리 수 |
|---|---------|----------------|
| 1 | 💻 IT & Software | 13개 |
| 100 | 📈 Marketing & Sales | 11개 |
| 200 | 🎨 Design & Creative | 8개 |
| 300 | 🎧 Customer Service | 6개 |
| 400 | 💰 Finance & Accounting | 7개 |
| 500 | 👥 Human Resources | 6개 |
| 600 | 📚 Education & Training | 6개 |
| 700 | ⚕️ Healthcare & Medical | 8개 |
| 800 | ⚙️ Engineering | 7개 |
| 900 | 🏭 Manufacturing & Production | 6개 |
| 1000 | 🚚 Logistics & Supply Chain | 6개 |
| 1100 | 🍽️ Hospitality & Food Service | 8개 |
| 1200 | 🏗️ Construction & Architecture | 19개 |
| 1300 | ⚖️ Legal & Compliance | 5개 |
| 1400 | 📺 Media & Communications | 7개 |
| 1500 | 📁 Administrative & Office Support | 6개 |
| 1600 | 🌾 Agriculture & Farming | 5개 |
| 1700 | 📌 Others | 6개 |

## 데이터 확인

삽입 후 다음 쿼리로 데이터를 확인할 수 있습니다:

```sql
-- 전체 카테고리 수 확인
SELECT COUNT(*) FROM categories;
-- 결과: 158

-- 1차 카테고리 확인
SELECT * FROM categories WHERE parent_category IS NULL ORDER BY category_id;

-- 1차 카테고리와 하위 카테고리 개수
SELECT
  c1.category_id,
  c1.name as category,
  c1.icon,
  COUNT(c2.category_id) as subcategory_count
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_category = c1.name
WHERE c1.parent_category IS NULL
GROUP BY c1.category_id, c1.name, c1.icon
ORDER BY c1.category_id;

-- 특정 카테고리의 하위 항목 확인 (예: IT & Software)
SELECT * FROM categories
WHERE parent_category = 'IT & Software'
ORDER BY category_id;
```

## 주요 2차 카테고리 예시

### IT & Software (13개)
- Web Development, Mobile Development, Backend Development, Frontend Development
- Full Stack Development, DevOps & Cloud, Data Science & Analytics
- AI & Machine Learning, QA & Testing, IT Support & Helpdesk
- Network & Security, Database Administration, UI/UX Design

### Marketing & Sales (11개)
- Digital Marketing, Social Media Marketing, Content Marketing
- SEO/SEM, Email Marketing, Brand Management
- Product Marketing, Sales Executive, Business Development
- Account Management, Retail Sales

### Design & Creative (8개)
- Graphic Design, Product Design, Interior Design, Fashion Design
- Video Editing, Photography, Animation & 3D, Illustration

### Construction & Architecture (19개)
- Architect, Construction Manager, Site Engineer, Surveyor
- Carpenter, Electrician, Plumber, Welder
- **Bricklayer/Mason** (벽돌공/미장공), **Plasterer** (미장공)
- **Tile Setter** (타일공), **Painter** (페인트공)
- **Rebar Worker** (철근공), **Scaffolder** (비계공)
- Waterproofing Specialist, Glazier, Roofer
- Crane Operator, Heavy Equipment Operator

기타 카테고리는 SQL 파일에서 확인할 수 있습니다.
