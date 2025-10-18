# 🚀 Vercel 배포 가이드

## ✅ Git Push 완료

```
✅ Commit: feat: 구인구직 플랫폼으로 전환 + 모바일 우선 UI
✅ Push: https://github.com/bodu1197/kerja_monggo.git
✅ Branch: master
```

---

## 🌐 Vercel 배포 방법

### 옵션 1: GitHub 자동 배포 (추천)

#### 이미 Vercel 연결되어 있는 경우

1. **Vercel Dashboard 확인**
   ```
   https://vercel.com/dashboard
   ```

2. **자동 배포 진행 중**
   - Deployments 탭에서 진행 상황 확인
   - 보통 2-3분 소요
   - 완료되면 자동으로 URL 생성

3. **배포 URL 확인**
   ```
   https://kerja-monggo.vercel.app (예상)
   또는
   https://[your-project].vercel.app
   ```

#### Vercel 연결이 안 되어 있는 경우

1. **Vercel 접속**
   ```
   https://vercel.com
   ```

2. **GitHub로 로그인**
   - "Continue with GitHub" 클릭

3. **New Project**
   - "Add New..." → "Project" 클릭
   - GitHub repository 선택: `bodu1197/kerja_monggo`
   - "Import" 클릭

4. **환경변수 설정**
   - "Environment Variables" 섹션에서:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://zthksbitvezxwhbymatz.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [.env.local에서 복사]
   ```

5. **Deploy 클릭**
   - 자동으로 빌드 시작
   - 2-3분 후 완료

---

## 📋 환경변수 설정 (중요!)

### Vercel Dashboard에서 설정

1. **프로젝트 선택**
   - Dashboard → 프로젝트 클릭

2. **Settings → Environment Variables**

3. **추가할 변수들**:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://zthksbitvezxwhbymatz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0aGtzYml0dmV6eHdoYnltYXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg1NzExOTgsImV4cCI6MjA0NDE0NzE5OH0.3U0KO7CNM0et5Q85YC0L-mQzR5WZLkGRs9l9U6AkTiA
```

4. **Environment 선택**
   - Production ✅
   - Preview ✅
   - Development ✅ (모두 체크)

5. **Save**

6. **재배포**
   - Deployments 탭
   - 최신 배포 → 점 3개 메뉴 → "Redeploy"

---

## 🔍 배포 확인 방법

### 1. Vercel Dashboard

```
https://vercel.com/dashboard
→ 프로젝트 클릭
→ Deployments 탭
```

**상태 확인**:
- ⏳ Building... (빌드 중)
- ✅ Ready (배포 완료)
- ❌ Error (오류 발생)

### 2. 배포 로그 확인

- Deployment 클릭
- "Build Logs" 탭
- 에러가 있으면 빨간색으로 표시

### 3. 실제 사이트 접속

배포 완료 후:
```
https://[your-project].vercel.app
```

모바일에서도 확인:
- 스마트폰에서 위 URL 접속
- 600px 너비로 자동 조정 확인

---

## 🐛 문제 해결

### 빌드 에러 발생 시

#### 1. Tailwind CSS 4.x 관련 에러

**에러 메시지**:
```
Module not found: Can't resolve 'tailwindcss'
```

**해결**:
```bash
# package.json 확인
"@tailwindcss/postcss": "^4.1.14"
"tailwindcss": "^4.1.14"
```

#### 2. 환경변수 누락 에러

**에러 메시지**:
```
NEXT_PUBLIC_SUPABASE_URL is not defined
```

**해결**:
- Vercel Dashboard → Settings → Environment Variables
- 위의 환경변수 추가
- Redeploy

#### 3. Next.js 버전 에러

**에러 메시지**:
```
Invalid Next.js version
```

**해결**:
```json
// package.json 확인
"next": "^15.5.6"
```

---

## ⚡ 빠른 배포 체크리스트

배포 전:
- [x] Git push 완료
- [ ] Vercel 프로젝트 생성/연결
- [ ] 환경변수 설정
- [ ] 배포 완료 대기 (2-3분)

배포 후:
- [ ] 배포 URL 접속
- [ ] PC에서 확인 (600px 중앙 정렬)
- [ ] 모바일에서 확인
- [ ] 기능 테스트 (검색, 네비게이션)

---

## 🔗 유용한 링크

### Vercel
- **Dashboard**: https://vercel.com/dashboard
- **Docs**: https://vercel.com/docs

### GitHub Repository
- **Repository**: https://github.com/bodu1197/kerja_monggo
- **Commits**: https://github.com/bodu1197/kerja_monggo/commits/master

### Supabase
- **Dashboard**: https://supabase.com/dashboard
- **Project**: https://supabase.com/dashboard/project/zthksbitvezxwhbymatz

---

## 📱 배포 후 테스트

### PC에서 테스트
```
1. 배포 URL 접속
2. F12 → 개발자 도구
3. Elements 탭 → .mobile-container 확인
4. max-width: 600px 확인
5. 중앙 정렬 확인
```

### 모바일에서 테스트
```
1. 스마트폰에서 URL 접속
2. 하단 네비게이션 바 확인
3. 카테고리 그리드 (4열) 확인
4. 채용공고 카드 확인
5. 터치 반응 확인
```

---

## 🎯 예상 배포 URL

프로젝트명이 `kerja-monggo`라면:

```
Production: https://kerja-monggo.vercel.app
Preview: https://kerja-monggo-git-master-[username].vercel.app
```

---

## 💡 자동 배포 설정

매 Push마다 자동 배포하려면:

1. **Vercel Dashboard**
   - Settings → Git

2. **자동 배포 활성화**
   - ✅ Production Branch: master
   - ✅ Preview Deployment: 모든 브랜치

3. **이제부터**
   ```bash
   git push
   # → Vercel이 자동으로 배포 시작
   # → 2-3분 후 자동 배포 완료
   ```

---

## 🔥 핫 리로드 (Hot Reload)

개발 중:

1. **로컬에서 작업**
   ```
   npm run dev (localhost:3003)
   ```

2. **수정 후 Push**
   ```bash
   git add .
   git commit -m "fix: UI 수정"
   git push
   ```

3. **Vercel 자동 배포**
   - 자동으로 감지
   - 자동으로 빌드
   - 자동으로 배포
   - 완료 후 Slack/Email 알림 (선택)

---

## 📊 배포 현황

**최신 배포**:
```
Commit: 97085c9
Message: feat: 구인구직 플랫폼으로 전환 + 모바일 우선 UI
Date: 2025-10-18
Status: ✅ Pushed to GitHub
```

**다음 단계**:
1. Vercel Dashboard에서 배포 상태 확인
2. 배포 URL 접속
3. 기능 테스트
4. 이슈 발견 시 수정 → Push → 자동 재배포

---

**작성일**: 2025-10-18
**상태**: Ready for Deployment ✅
**배포 방법**: GitHub Auto Deploy (Vercel)
