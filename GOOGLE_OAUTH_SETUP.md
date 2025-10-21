# Google OAuth 설정 가이드

## 에러 해결: "Unsupported provider: provider is not enabled"

이 에러는 Supabase에서 Google OAuth가 활성화되지 않아서 발생합니다.

---

## 🚀 빠른 설정 (3단계)

### 1단계: Google Cloud Console 설정

#### OAuth 동의 화면 생성
1. https://console.cloud.google.com/apis/credentials/consent 접속
2. User Type: **External** 선택 → Create
3. 앱 정보 입력:
   - App name: `KerjaMonggo`
   - User support email: [본인 이메일]
   - Developer contact: [본인 이메일]
4. Save and Continue (3번 클릭하여 완료)

#### OAuth 클라이언트 ID 생성
1. https://console.cloud.google.com/apis/credentials 접속
2. **+ CREATE CREDENTIALS → OAuth client ID**
3. Application type: **Web application**
4. Name: `KerjaMonggo Web Client`
5. **Authorized redirect URIs** 추가:
   ```
   https://ffcksaqokpunfhlvgigw.supabase.co/auth/v1/callback
   http://localhost:54321/auth/v1/callback
   ```
6. CREATE → **Client ID와 Client Secret 복사**

---

### 2단계: Supabase 설정

#### Google 프로바이더 활성화
1. https://supabase.com/dashboard/project/ffcksaqokpunfhlvgigw/auth/providers 접속
2. **Google** 프로바이더 찾기
3. **Enable** 토글 ON
4. Google Cloud Console에서 복사한 정보 입력:
   - **Client ID**: [붙여넣기]
   - **Client Secret**: [붙여넣기]
5. **Save** 클릭

#### Redirect URLs 설정
1. https://supabase.com/dashboard/project/ffcksaqokpunfhlvgigw/auth/url-configuration 접속
2. **Redirect URLs**에 추가:
   ```
   http://localhost:3000/auth/callback
   https://[your-vercel-domain]/auth/callback
   ```
3. **Save** 클릭

---

### 3단계: 테스트

```bash
# 개발 서버 재시작
npm run dev

# 브라우저에서 접속
http://localhost:3000/signup

# "구글로 가입" 버튼 클릭 → Google 로그인 화면이 나타나야 함
```

---

## 🔐 중요한 URL들

### Supabase Callback URL (Google Cloud Console에 입력)
```
https://ffcksaqokpunfhlvgigw.supabase.co/auth/v1/callback
```

### 앱 Redirect URLs (Supabase에 입력)
```
http://localhost:3000/auth/callback
https://[your-domain]/auth/callback
```

---

## ❌ 자주 발생하는 문제

### 1. "redirect_uri_mismatch" 에러
**원인**: Google Cloud Console의 Authorized redirect URIs와 실제 redirect URI가 불일치

**해결**:
- Google Cloud Console → Credentials → OAuth 2.0 Client IDs → 해당 클라이언트 편집
- Authorized redirect URIs에 정확히 추가:
  ```
  https://ffcksaqokpunfhlvgigw.supabase.co/auth/v1/callback
  ```

### 2. "Unsupported provider" 에러
**원인**: Supabase에서 Google 프로바이더 활성화 안 됨

**해결**:
- Supabase Dashboard → Authentication → Providers → Google → Enable

### 3. "Access blocked: This app's request is invalid"
**원인**: OAuth 동의 화면 미설정

**해결**:
- Google Cloud Console → APIs & Services → OAuth consent screen 설정 완료

---

## 📊 설정 체크리스트

### Google Cloud Console
- [ ] OAuth 동의 화면 생성 완료
- [ ] OAuth 클라이언트 ID 생성 완료
- [ ] Authorized redirect URIs에 Supabase callback URL 추가
- [ ] Client ID와 Client Secret 복사

### Supabase Dashboard
- [ ] Google 프로바이더 활성화
- [ ] Client ID 입력
- [ ] Client Secret 입력
- [ ] Redirect URLs에 `/auth/callback` 경로 추가
- [ ] Site URL 설정

### 로컬 테스트
- [ ] 개발 서버 재시작
- [ ] 구글 로그인 버튼 클릭 → Google 로그인 화면 표시
- [ ] 로그인 성공 → `/auth/callback`으로 리다이렉트
- [ ] user_type 선택 화면 표시

---

## 🎯 프로덕션 배포 시

Vercel 배포 후 다음 작업 필수:

1. **Vercel 도메인 확인**
   ```
   예: https://kerja-monggo.vercel.app
   ```

2. **Google Cloud Console 업데이트**
   - Authorized JavaScript origins 추가:
     ```
     https://kerja-monggo.vercel.app
     ```
   - Authorized redirect URIs 추가:
     ```
     https://kerja-monggo.vercel.app
     ```

3. **Supabase Redirect URLs 업데이트**
   ```
   https://kerja-monggo.vercel.app/auth/callback
   ```

---

## 💡 팁

### 로컬 + 프로덕션 동시 사용
하나의 OAuth 클라이언트에 로컬과 프로덕션 URI 모두 추가 가능:

**Authorized redirect URIs:**
```
http://localhost:54321/auth/v1/callback
https://ffcksaqokpunfhlvgigw.supabase.co/auth/v1/callback
```

**Supabase Redirect URLs:**
```
http://localhost:3000/auth/callback
https://[your-domain]/auth/callback
```

---

## 📞 문제 해결

설정 후에도 문제가 계속되면:

1. **브라우저 캐시 삭제**
2. **시크릿 모드에서 테스트**
3. **Supabase와 Google Cloud Console 설정 재확인**
4. **개발 서버 재시작**

---

**작성일**: 2025-10-21
**프로젝트**: KerjaMonggo
**Supabase Project ID**: ffcksaqokpunfhlvgigw
