/** 설계 단계 최대 3 + 심화 단계 최대 3. 질문 1개당 TEXT 토큰 1개 */
export const SYSTEM_DESIGN_MAX_QUESTION_COUNT: number = 6;
export const SYSTEM_DESIGN_MAX_REQUIREMENT_QUESTION_COUNT: number = 5;
export const SYSTEM_DESIGN_ESTIMATED_MINUTES: number = 40;

/**
 * 시스템 설계 면접을 고를 수 있는지.
 *
 * API 가 dev 백엔드에만 있어서 dev 배포(NEXT_PUBLIC_SYSTEM_DESIGN_ENABLED=true)와
 * 목을 켠 개발 서버(yarn dev:mock)에서만 연다. 운영 빌드에서는 "준비 중"으로 막는다.
 * 운영 백엔드에 배포되면 deploy.yml 에도 같은 값을 넣는다.
 */
export const IS_SYSTEM_DESIGN_AVAILABLE: boolean =
  process.env.NEXT_PUBLIC_SYSTEM_DESIGN_ENABLED === "true" ||
  process.env.NEXT_PUBLIC_API_MOCKING === "enabled";
