# 라우팅 & 페이지 맵

## 공개 페이지

| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `pages/index.tsx` | 랜딩 페이지 |
| `/login` | `pages/login/index.tsx` | 로그인 |
| `/login/callback` | `pages/login/callback.tsx` | OAuth 콜백 |
| `/login/google/callback` | `pages/login/google/callback.tsx` | Google OAuth 콜백 |
| `/login/profile` | `pages/login/profile.tsx` | 최초 프로필 설정 |
| `/interviews` | `pages/interviews/index.tsx` | 면접 메인 (생성) |
| `/interviews/[interviewId]` | `pages/interviews/[interviewId]/index.tsx` | 면접 진행 |
| `/interviews/[interviewId]/result` | `pages/interviews/[interviewId]/result.tsx` | 면접 결과 |
| `/members/[memberId]` | `pages/members/[memberId]/index.tsx` | 멤버 프로필 |
| `/members/interviews/[interviewId]` | `pages/members/interviews/[interviewId].tsx` | 멤버 면접 결과 열람 |
| `/rank` | `pages/rank/index.tsx` | 랭킹 |
| `/recruit` | `pages/recruit/index.tsx` | 채용 공고 |
| `/resume` | `pages/resume/index.tsx` | 이력서 메인 |
| `/resume/eval` | `pages/resume/eval/index.tsx` | 이력서 평가 |
| `/resume/eval/demo` | `pages/resume/eval/demo.tsx` | 이력서 평가 데모 |
| `/resume/eval/[evaluationId]/result` | `pages/resume/eval/[evaluationId]/result.tsx` | 평가 결과 |
| `/resume/interview` | `pages/resume/interview/index.tsx` | 이력서 기반 면접 |
| `/resume/interview/[interviewId]` | `pages/resume/interview/[interviewId].tsx` | 이력서 면접 진행 |
| `/purchase` | `pages/purchase/index.tsx` | 결제 |
| `/purchase/confirm` | `pages/purchase/confirm.tsx` | 결제 확인 |
| `/purchase/error` | `pages/purchase/error.tsx` | 결제 실패 |
| `/terms/privacy` | `pages/terms/privacy.tsx` | 개인정보처리방침 |
| `/terms/termsofuse` | `pages/terms/termsofuse.tsx` | 이용약관 |

## 보호 페이지 (로그인 필요)

| 경로 | 파일 | 설명 |
|------|------|------|
| `/dashboard` | `pages/dashboard/index.tsx` | 대시보드 |
| `/admin` | `pages/admin/index.tsx` | 관리자 메인 |
| `/admin/payments` | `pages/admin/payments.tsx` | 관리자 결제내역 |
| `/admin/questions` | `pages/admin/questions.tsx` | 관리자 질문 관리 |

## 인증 미들웨어

`src/middleware.ts`에서 `PROTECTED_PATHS`에 등록된 경로를 보호:
- `JSESSIONID` 쿠키가 없으면 `/login?redirectTo=...`으로 리다이렉트
- 정적 자산(`/_next`, `/api`, `.`이 포함된 경로)은 패스

## API 라우트

| 경로 | 역할 |
|------|------|
| `/api/auth/logout` | 로그아웃 처리 |

## SEO / 사이트맵

- `next-sitemap.config.js` 기반 사이트맵 생성
- `/server-sitemap.xml` — 동적 사이트맵
- `/sitemap/rank.xml` — 랭킹 페이지 사이트맵
- `/members/[memberId]/sitemap.xml` — 멤버별 사이트맵
