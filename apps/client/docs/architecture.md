# Client Architecture

## 기술 스택

- **Framework**: Next.js 15 (Pages Router)
- **Language**: TypeScript
- **상태 관리**: TanStack React Query (서버 상태), React Context (클라이언트 상태)
- **스타일링**: Tailwind CSS v4
- **폼**: React Hook Form + Zod
- **HTTP 클라이언트**: Axios
- **모니터링**: Sentry (에러 추적), PostHog (분석)
- **테스트**: Jest + React Testing Library + MSW
- **모노레포 패키지**: `@kokomen/ui`, `@kokomen/types`, `@kokomen/utils`

## 디렉토리 구조

```
src/
├── api/            # 공통 Axios 인스턴스 (serverInstance)
├── domains/        # 도메인별 기능 모듈 (핵심 비즈니스 로직)
│   ├── admin/      # 관리자 (결제내역, 루트질문 관리)
│   ├── auth/       # 인증 (프로필 설정)
│   ├── dashboard/  # 대시보드 (닉네임, 스트릭, 면접기록)
│   ├── interview/  # 면접 진행 (핵심 도메인)
│   ├── interviewReport/ # 면접 결과 리포트
│   ├── landing/    # 랜딩 페이지
│   ├── members/    # 멤버 프로필/랭킹
│   ├── notifications/ # 알림
│   ├── purchase/   # 결제 (토스페이먼츠)
│   ├── recruit/    # 채용 공고
│   └── resume/     # 이력서 평가/면접
├── hooks/          # 공통 커스텀 훅
├── mocks/          # MSW 핸들러
├── pages/          # Next.js Pages Router 라우트
├── shared/         # 공통 UI 컴포넌트 (Header, Footer, SEO 등)
├── styles/         # globals.css (Tailwind)
└── utils/          # 유틸리티 (querykeys, auth, pagination 등)
```

## 도메인 모듈 구조

각 도메인은 다음과 같은 하위 구조를 가짐:

```
domains/{domain}/
├── api/           # API 호출 함수
├── components/    # 도메인 전용 UI 컴포넌트
├── hooks/         # 도메인 전용 커스텀 훅
├── utils/         # 도메인 전용 유틸리티
├── constants/     # 상수
└── context/       # React Context 스토어
```

## 앱 프로바이더 구조 (_app.tsx)

```
QueryClientProvider
  └─ ErrorBoundary (Sentry)
      └─ Toaster (@kokomen/ui)
          └─ ResumeStoreProvider
              └─ ResumeBasedInterviewStoreProvider
                  └─ Page + FeedbackButton
```

## API 계층

- `NEXT_PUBLIC_API_BASE_URL` — v1 API (면접, 인증, 멤버 등)
- `NEXT_PUBLIC_V2_API_BASE_URL` — v2 API (면접 답변 제출/폴링)
- `NEXT_PUBLIC_V3_API_BASE_URL` — v3 API (질문 조회, 커스텀 면접)
- `NEXT_PUBLIC_NOTIFICATION_API_BASE_URL` — 알림 API
- `NEXT_PUBLIC_CDN_BASE_URL` — CDN (이미지 등)

### API 호출 패턴

1. 각 도메인의 `api/` 디렉토리에 Axios 인스턴스와 호출 함수 정의
2. 인증은 `withCredentials: true` + `JSESSIONID` 쿠키 기반
3. 재시도는 Axios interceptor에서 exponential backoff로 처리
4. 비동기 작업(LLM 응답 등)은 polling 패턴 사용 (answerV2ServerInstance)

## 인증 흐름

- Google OAuth → 카카오(?) 로그인 콜백 → JSESSIONID 쿠키 설정
- Middleware에서 `/dashboard`, `/admin` 경로를 보호
- 쿠키 없으면 `/login?redirectTo=...`으로 리다이렉트

## React Query 키 관리

`src/utils/querykeys.ts`에서 도메인별 QueryKeyFactory 패턴으로 관리:
- `interviewHistoryKeys`, `interviewKeys`, `interviewQuestionKeys`
- `memberKeys`, `purchaseKeys`, `recruitKeys`
- `archiveKeys`, `resumeBasedInterviewKeys`, `resumeEvaluationKeys`
- `adminPaymentKeys`, `adminQuestionKeys`
