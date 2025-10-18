# 🚀 KerjaMonggo 설정 가이드

## ✅ 현재 상태

### 완료된 작업
- ✅ **UI를 모바일 우선 디자인으로 전환** (600px 최대 너비)
- ✅ **Next.js 15.5.6 개발 서버 실행 중** (http://localhost:3003)
- ✅ **구인구직 플랫폼 DB 스키마 설계 완료**
- ✅ **마이그레이션 SQL 준비 완료**

### 대기 중인 작업
- ⏳ **Supabase 마이그레이션 실행** (수동 필요)
- ⏳ **실제 데이터베이스와 연동**

---

## 📱 새로운 UI 디자인

### 핵심 특징
```
✨ 모바일 앱 스타일
✨ 600px 고정 너비 (PC에서도 모바일처럼)
✨ 하단 네비게이션 바
✨ 카드 기반 레이아웃
✨ 터치 친화적 UI
```

### 디자인 시스템
- **최대 너비**: 600px (모든 디바이스)
- **Primary Color**: #10b981 (Green)
- **배경**: 밝은 그레이 (#f3f4f6)
- **카드**: 화이트 + 그림자
- **폰트**: System Fonts (iOS/Android 네이티브)

### 주요 컴포넌트

#### 1. 상단 헤더 (Sticky)
```jsx
- 로고: 🔍 KerjaMonggo
- 메뉴 버튼 (햄버거)
- 고정 위치 (sticky top)
- 그린 배경 (#10b981)
```

#### 2. 검색 섹션
```jsx
- 큰 제목: "Temukan Pekerjaan Impian"
- 검색 입력창 (아이콘 포함)
- "Cari di Sekitar Saya" 버튼 (위치 기반)
```

#### 3. 카테고리 그리드
```jsx
- 4열 그리드
- 이모지 아이콘 + 텍스트
- 8개 인기 카테고리
- 호버 효과
```

#### 4. 채용공고 카드
```jsx
구조:
┌─────────────────────────────────┐
│ 🏢  [회사명]              ❤️     │
│     Software Engineer           │
│     PT Tech Indonesia           │
│                                 │
│     📍 Jakarta  💼 Full-time    │
│     💰 8-15 Juta                │
│                                 │
│     2 hari yang lalu            │
└─────────────────────────────────┘
```

#### 5. 하단 네비게이션 (Fixed Bottom)
```jsx
┌──────────────────────────────────┐
│  🏠      💼      ❤️      👤      │
│ Beranda Lowongan Tersimpan Profil│
└──────────────────────────────────┘
```

---

## 🗄️ Supabase 마이그레이션

### ⚠️ 중요: 수동 실행 필요

CLI 자동 실행이 불가능하므로 **Supabase Dashboard**에서 수동 실행이 필요합니다.

### 📝 실행 방법

#### 옵션 1: Supabase Dashboard (추천)

1. **브라우저에서 Supabase 열기**
   ```
   https://supabase.com/dashboard
   ```

2. **프로젝트 선택**
   - Project: `zthksbitvezxwhbymatz`

3. **SQL Editor 열기**
   - 왼쪽 메뉴 → SQL Editor

4. **마이그레이션 SQL 복사**
   - 파일 경로: `C:\Users\ohyus\jobmonggo\supabase\migrations\00_job_platform_schema.sql`
   - 파일 전체 내용 복사

5. **SQL 실행**
   - SQL Editor에 붙여넣기
   - Run 버튼 클릭
   - ✅ 성공 메시지 확인

#### 옵션 2: Supabase CLI (로컬 동기화 후)

```bash
# 1. 원격 마이그레이션 수정
supabase migration repair --status reverted [migration_ids...]

# 2. 로컬과 원격 동기화
supabase db pull

# 3. 새 마이그레이션 적용
supabase db push
```

---

## ✅ 마이그레이션 검증

SQL 실행 후 다음 쿼리로 확인:

### 1. 새 테이블 확인
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'companies',
    'jobs',
    'candidate_profiles',
    'applications',
    'education',
    'work_experience',
    'certifications',
    'saved_jobs',
    'job_views'
  )
ORDER BY tablename;
```
**결과**: 9개 테이블이 나와야 함

### 2. 백업 테이블 확인
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '_backup_%'
ORDER BY tablename;
```
**결과**: 6개 백업 테이블 (_backup_products, _backup_product_images 등)

### 3. ENUM 타입 확인
```sql
SELECT typname
FROM pg_type
WHERE typname IN (
  'employment_type',
  'experience_level',
  'job_status',
  'application_status',
  'education_level'
);
```
**결과**: 5개 ENUM 타입

### 4. 함수 확인
```sql
SELECT proname
FROM pg_proc
WHERE proname IN (
  'nearby_jobs',
  'search_jobs',
  'jobs_search_vector_update'
);
```
**결과**: 3개 함수

### 5. RLS 정책 확인
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('companies', 'jobs', 'candidate_profiles', 'applications')
ORDER BY tablename, policyname;
```
**결과**: 다수의 RLS 정책

---

## 🌐 현재 접속 정보

### 개발 서버
```
URL: http://localhost:3003
Status: ✅ Running
Port: 3003 (3000 occupied)
```

### 테스트 방법

1. **브라우저 열기**
   ```
   http://localhost:3003
   ```

2. **모바일 뷰 확인**
   - F12 → 개발자 도구
   - 디바이스 툴바 (Ctrl+Shift+M)
   - iPhone/Android 선택

3. **PC 뷰 확인**
   - 일반 브라우저 크기
   - 600px 최대 너비 자동 적용
   - 중앙 정렬 확인

---

## 📁 파일 구조

```
C:\Users\ohyus\jobmonggo\
│
├── app/
│   ├── globals.css              ✨ 모바일 우선 스타일
│   ├── layout.jsx               ✨ 새 레이아웃 (헤더+하단바)
│   ├── page.jsx                 ✨ 새 홈페이지 (모바일 스타일)
│   ├── components/
│   │   └── SupabaseProvider.jsx
│   └── utils/
│       └── supabase-server.js
│
├── supabase/
│   ├── schema.sql               📄 기존 전체 스키마 (백업)
│   └── migrations/
│       └── 00_job_platform_schema.sql  ✨ 마이그레이션 SQL
│
├── package.json
├── .env.local                   🔒 환경변수
├── MIGRATION_REPORT.md          📊 상세 보고서
└── SETUP_GUIDE.md               📖 이 문서
```

---

## 🎨 UI 스크린샷 설명

### 홈페이지 레이아웃

```
┌─────────────────────────┐
│ 🔍 KerjaMonggo     ☰   │ ← Sticky Header
├─────────────────────────┤
│                         │
│ Temukan Pekerjaan...    │ ← Hero Section (Green)
│ [Search Box]            │
│ 📍 Cari di Sekitar Saya │
│                         │
├─────────────────────────┤
│ Kategori Populer        │
│ 💻 🏗️ 🏨 🛒            │ ← 4-column Grid
│ 💰 📚 🏥 🎨            │
├─────────────────────────┤
│                         │
│ Lowongan Terbaru →      │
│                         │
│ ┌───────────────────┐   │
│ │🏢 Software Eng   │   │ ← Job Cards
│ │   PT Tech Indo   │   │
│ │   📍💼💰        │   │
│ └───────────────────┘   │
│                         │
│ [더 많은 카드...]        │
│                         │
├─────────────────────────┤
│ 10K+ | 5K+ | 50K+      │ ← Stats
├─────────────────────────┤
│ 🏠 💼 ❤️ 👤          │ ← Bottom Nav (Fixed)
└─────────────────────────┘
```

---

## 🔧 다음 단계

### 즉시 실행
1. ✅ **브라우저에서 확인**: http://localhost:3003
2. ⏳ **Supabase 마이그레이션 실행** (위의 방법대로)
3. ⏳ **마이그레이션 검증** (SQL 쿼리로)

### 단기 (1-2일)
4. 테스트 데이터 입력
   - 샘플 기업 5개
   - 샘플 채용공고 20개
   - 샘플 구직자 5명

5. 실제 데이터 연동
   - Supabase 클라이언트 설정
   - API 함수 작성
   - 실제 DB 데이터 표시

### 중기 (1주)
6. 주요 페이지 개발
   - `/jobs` - 채용공고 목록
   - `/jobs/[id]` - 채용공고 상세
   - `/companies` - 기업 목록
   - `/profile` - 프로필 관리

7. 인증 시스템
   - NextAuth.js 설정
   - Google OAuth
   - 로그인/회원가입

---

## 💡 팁

### 모바일 테스트
```javascript
// 크롬 개발자 도구
1. F12 키
2. Ctrl+Shift+M (디바이스 모드)
3. iPhone 14 Pro 선택
4. 새로고침
```

### CSS 커스터마이징
```css
/* app/globals.css */
.mobile-container {
  max-width: 600px;  /* 원하는 너비로 변경 */
  margin: 0 auto;
}
```

### 색상 변경
```css
:root {
  --color-primary: #10b981;      /* 메인 컬러 */
  --color-primary-dark: #059669; /* 진한 버전 */
}
```

---

## 🆘 문제 해결

### 개발 서버가 안 뜨는 경우
```bash
# 1. 프로세스 종료
taskkill /F /IM node.exe

# 2. 재시작
npm run dev
```

### 포트 변경하고 싶은 경우
```bash
# package.json 수정
"dev": "next dev -p 3001"
```

### Tailwind CSS가 안 먹는 경우
```bash
# 캐시 삭제 후 재시작
rm -rf .next
npm run dev
```

---

## 📞 참고 링크

- **Next.js 문서**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase 문서**: https://supabase.com/docs
- **마이그레이션 상세 보고서**: `MIGRATION_REPORT.md`

---

**작성일**: 2025-10-18
**버전**: 1.0.0
**상태**: Ready for Development ✅
