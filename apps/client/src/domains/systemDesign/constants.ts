import type { InterviewDifficulty } from "@kokomen/types";

export const DIFFICULTY_OPTIONS: readonly {
  value: InterviewDifficulty;
  label: string;
  description: string;
}[] = [
  { value: "JUNIOR", label: "주니어", description: "0~2년" },
  { value: "MIDDLE", label: "미들", description: "3~5년" },
  { value: "SENIOR", label: "시니어", description: "6년 이상" }
];

export const getDifficultyLabel = (difficulty: InterviewDifficulty): string =>
  DIFFICULTY_OPTIONS.find((option) => option.value === difficulty)?.label ??
  difficulty;

/** 설계 단계 최대 3 + 심화 단계 최대 3. 질문 1개당 TEXT 토큰 1개 */
export const SYSTEM_DESIGN_MAX_QUESTION_COUNT: number = 6;
export const SYSTEM_DESIGN_MAX_REQUIREMENT_QUESTION_COUNT: number = 5;
export const SYSTEM_DESIGN_ESTIMATED_MINUTES: number = 40;

/**
 * 시스템 설계 면접을 고를 수 있는지.
 *
 * 백엔드 API 가 아직 없어서 MSW 목이 켜진 빌드(dev 배포, yarn dev:mock)에서만 연다.
 * 운영 빌드에서는 "준비 중"으로 막는다. 백엔드가 붙으면 이 값을 true 로 바꾸고 목 대기 코드를 지운다.
 */
export const IS_SYSTEM_DESIGN_AVAILABLE: boolean =
  process.env.NEXT_PUBLIC_API_MOCKING === "enabled";
