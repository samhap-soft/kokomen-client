/**
 * NEXT_PUBLIC_API_MOCKING=enabled 로 띄운 개발 서버(yarn dev:mock)에서만 MSW 브라우저 목을 켠다.
 *
 * 이 값은 빌드할 때 문자열로 박힌다. import() 를 그 비교식 if 블록 안에 둬야
 * webpack 이 운영 빌드에서 목 코드 청크를 아예 만들지 않는다.
 * 목이 준비되기 전에 나간 요청은 실제 서버로 가 버리므로, 목 대상 API 는 요청 전에 이 함수를 기다린다.
 */
let mockingPromise: Promise<void> | null = null;

export const isApiMockingEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_API_MOCKING === "enabled" &&
  typeof window !== "undefined";

export const enableMocking = (): Promise<void> => {
  if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
    if (typeof window === "undefined") return Promise.resolve();
    mockingPromise ??= import("@/mocks/browser").then(({ worker }) =>
      worker
        .start({ onUnhandledRequest: "bypass", quiet: true })
        .then(() => undefined)
    );
    return mockingPromise;
  }
  return Promise.resolve();
};
