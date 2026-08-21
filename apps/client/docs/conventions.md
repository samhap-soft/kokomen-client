# 코딩 컨벤션 & 개발 가이드

## 새 기능 추가 시

### 새 도메인 추가

1. `src/domains/{domain}/` 디렉토리 생성
2. 필요에 따라 `api/`, `components/`, `hooks/`, `utils/` 하위 디렉토리 추가
3. 해당 도메인의 query key를 `src/utils/querykeys.ts`에 추가
4. 페이지는 `src/pages/`에 Next.js 라우팅 규칙에 따라 생성

### 새 API 엔드포인트 추가

1. 해당 도메인의 `api/` 디렉토리에 함수 추가
2. 인증이 필요하면 `withCredentials: true` 설정
3. API 버전에 맞는 base URL 사용:
   - 기본: `NEXT_PUBLIC_API_BASE_URL`
   - v2 (폴링 필요): `NEXT_PUBLIC_V2_API_BASE_URL`
   - v3 (최신): `NEXT_PUBLIC_V3_API_BASE_URL`

### 새 페이지 추가

1. `src/pages/` 하위에 파일 생성 (Pages Router)
2. 보호가 필요한 경로는 `src/middleware.ts`의 `PROTECTED_PATHS`에 추가
3. SEO가 필요하면 `src/shared/seo` 컴포넌트 사용
4. 공통 레이아웃은 `src/pages/layout.tsx` 참고

## API 호출 패턴

### 기본 조회

```typescript
import { serverInstance } from "@/api";

export const getSomething = async (): Promise<SomeType> => {
  const { data } = await serverInstance.get("/endpoint", {
    withCredentials: true,
  });
  return data;
};
```

### 폴링이 필요한 비동기 작업

`src/domains/interview/api/interviewAnswer.ts` 패턴 참고:
- 별도 Axios 인스턴스 생성
- interceptor에서 `proceed_state` 확인 후 재요청
- retry 상태는 요청별 Map으로 관리

## React Query 사용

### Query Key 추가

`src/utils/querykeys.ts`에 `QueryKeyFactory` 패턴으로 추가:

```typescript
type NewDomainMethods = {
  byId: (id: number) => QueryKey;
};
const newDomainKeys: QueryKeyFactory<NewDomainMethods> = {
  all: ["newDomain"] as const,
  byId: (id: number): QueryKey => [...newDomainKeys.all, id] as const,
};
```

## 컴포넌트 간 통신

- 동일 도메인 내 느슨한 결합이 필요할 때: EventEmitter 패턴 (`utils/eventEmitter.ts`)
- 전역 상태가 필요할 때: React Context (`domains/{domain}/context/`)
- 서버 상태: React Query

## 환경 변수

`env.d.ts`에 타입 선언 추가 필수. 클라이언트 노출이 필요하면 `NEXT_PUBLIC_` 접두사 사용.

## 테스트

- `__tests__/` 디렉토리에 페이지 단위 테스트
- MSW로 API 모킹 (`src/mocks/`)
- 실행: `yarn test` (jest --runInBand)

## 빌드 & 배포

- `yarn build` → Next.js 빌드 (ESLint/TypeScript 에러 무시 설정됨)
- Docker 이미지: `Dockerfile` (멀티스테이지)
- Blue-Green 배포: `/scripts/blue-green-deploy.sh`
- ATS(Apache Traffic Server)가 리버스 프록시로 트래픽 라우팅
