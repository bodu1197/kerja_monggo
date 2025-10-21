# 회원 가입 시스템 개선 가이드

## 개선 내용

### 목표
**회원 가입 시 반드시 구인자(employer) 또는 구직자(job_seeker)를 선택하도록 개선**

## 구현된 기능

### 1. OAuth 콜백 처리 시스템
- **파일**: `app/auth/callback/page.jsx`
- **기능**:
  - 구글 로그인/회원가입 후 콜백 처리
  - user_type 자동 확인
  - 신규 가입자 → `/select-user-type`으로 리다이렉트
  - 기존 회원 → `/`으로 리다이렉트

### 2. 미들웨어 보호 시스템
- **파일**: `middleware.js`
- **기능**:
  - 모든 보호된 라우트에서 user_type 필수 체크
  - user_type 없는 사용자 자동으로 `/select-user-type`으로 리다이렉트
  - 공개 경로 예외 처리 (로그인, 회원가입 등)

### 3. 데이터베이스 트리거 통합
- **파일**: `supabase/migrations/20251021000000_fix_user_creation_trigger.sql`
- **기능**:
  - users와 profiles 테이블 동시 생성 트리거
  - 트리거 충돌 문제 해결

### 4. 사용자 경험 개선
- **수정된 파일**:
  - `app/contexts/AuthContext.jsx`: redirectTo를 `/auth/callback`으로 변경
  - `app/select-user-type/page.jsx`: `router.replace()` 사용으로 히스토리 관리
  - `app/signup/page.jsx`: `router.replace()` 사용

---

## 적용 방법

### 방법 1: Supabase CLI 사용 (로컬 개발)

```bash
# 1. Supabase CLI가 설치되어 있는지 확인
supabase --version

# 2. 로컬 Supabase 시작 (처음 사용하는 경우)
supabase start

# 3. 마이그레이션 적용
supabase db push

# 또는 특정 마이그레이션만 적용
supabase db push --include 20251021000000_fix_user_creation_trigger.sql
```

### 방법 2: Supabase 대시보드 사용 (프로덕션)

1. Supabase 대시보드 접속
2. 프로젝트 선택
3. SQL Editor 메뉴 클릭
4. `supabase/migrations/20251021000000_fix_user_creation_trigger.sql` 내용 복사
5. SQL Editor에 붙여넣기
6. "RUN" 버튼 클릭

---

## 테스트 시나리오

### 시나리오 1: 이메일 회원가입
1. `/signup` 페이지 접속
2. 이메일과 비밀번호 입력
3. "회원가입" 버튼 클릭
4. ✅ `/select-user-type` 페이지로 자동 이동
5. 구인자 또는 구직자 선택
6. "선택 완료" 버튼 클릭
7. ✅ 메인 페이지(`/`)로 이동
8. 브라우저 뒤로가기 클릭
9. ✅ 회원 타입 선택 페이지로 돌아가지 않음 (히스토리 관리)

### 시나리오 2: 구글 회원가입 (신규 사용자)
1. `/signup` 페이지 접속
2. "구글로 가입" 버튼 클릭
3. 구글 OAuth 인증 완료
4. ✅ 자동으로 `/auth/callback`에서 user_type 체크
5. ✅ user_type 없음 → `/select-user-type`으로 리다이렉트
6. 구인자 또는 구직자 선택
7. "선택 완료" 버튼 클릭
8. ✅ 메인 페이지로 이동

### 시나리오 3: 구글 로그인 (기존 회원)
1. `/login` 페이지 접속
2. "구글로 로그인" 버튼 클릭
3. 구글 OAuth 인증 완료
4. ✅ 자동으로 `/auth/callback`에서 user_type 체크
5. ✅ user_type 있음 → 바로 메인 페이지(`/`)로 이동
6. ✅ 회원 타입 선택 페이지를 거치지 않음

### 시나리오 4: 미들웨어 보호 (user_type 없는 사용자)
1. 회원가입 후 user_type 선택 없이 브라우저 새로고침
2. ✅ 자동으로 `/select-user-type`으로 리다이렉트
3. user_type 선택 없이 다른 페이지 접근 시도 (예: `/profile`)
4. ✅ 자동으로 `/select-user-type`으로 리다이렉트

### 시나리오 5: 미들웨어 보호 (user_type 있는 사용자)
1. user_type이 설정된 사용자로 로그인
2. 모든 페이지 정상 접근 가능
3. ✅ `/select-user-type` 접근 시도
4. ✅ 자동으로 메인 페이지로 리다이렉트

---

## 변경된 파일 목록

### 새로 생성된 파일
- `app/auth/callback/page.jsx` - OAuth 콜백 처리 페이지
- `middleware.js` - 전역 user_type 체크 미들웨어
- `supabase/migrations/20251021000000_fix_user_creation_trigger.sql` - 트리거 통합 마이그레이션

### 수정된 파일
- `app/contexts/AuthContext.jsx` - redirectTo 경로 변경
- `app/select-user-type/page.jsx` - router.replace 사용
- `app/signup/page.jsx` - router.replace 사용

---

## 주요 개선 사항

### ✅ 회원 가입 시 user_type 필수 선택
- 이메일 회원가입, 구글 회원가입 모두 회원 타입 선택 필수
- 선택 없이는 서비스 이용 불가

### ✅ 로그인/회원가입 자동 구분
- 구글 로그인 시 기존 회원 자동 감지
- 기존 회원은 회원 타입 선택 페이지 건너뜀

### ✅ 완벽한 보안
- 미들웨어로 모든 경로 보호
- user_type 없는 사용자 자동 리다이렉트

### ✅ 향상된 UX
- 브라우저 히스토리 관리로 뒤로가기 오작동 방지
- 명확한 로딩 상태 표시
- 에러 메시지 처리

---

## 문제 해결

### 마이그레이션 오류
**증상**: 마이그레이션 실행 시 트리거가 이미 존재한다는 오류

**해결**:
```sql
-- Supabase SQL Editor에서 직접 실행
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

그 후 마이그레이션 다시 실행

### OAuth 리다이렉트 오류
**증상**: 구글 로그인 후 404 에러

**해결**:
1. Supabase 대시보드 → Authentication → URL Configuration
2. Redirect URLs에 추가:
   - `http://localhost:3000/auth/callback` (개발)
   - `https://yourdomain.com/auth/callback` (프로덕션)

### 미들웨어 무한 리다이렉트
**증상**: 페이지 로딩이 무한 반복됨

**해결**: 브라우저 쿠키 삭제 후 재로그인

---

## 다음 단계 권장 사항

1. **이메일 인증 활성화** (선택사항)
   - Supabase 대시보드에서 이메일 인증 활성화
   - 회원가입 후 이메일 인증 페이지 추가

2. **회원 타입별 권한 체크 강화**
   - 구인자만 채용 공고 등록 가능
   - 구직자만 이력서 등록 가능

3. **분석 추가**
   - Google Analytics로 회원 타입별 가입률 추적
   - 전환율 최적화

---

## 지원

문제가 발생하면 다음을 확인하세요:
1. Supabase 프로젝트 URL과 ANON_KEY가 `.env.local`에 올바르게 설정되었는지
2. 마이그레이션이 정상적으로 적용되었는지
3. OAuth 리다이렉트 URL이 Supabase에 등록되었는지

**생성일**: 2025-10-21
**버전**: 1.0.0
