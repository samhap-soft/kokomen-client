/** 온보딩 설문에서 사용하는 서버 enum 값들 */
type CareerGoal =
  | "BACKEND"
  | "FRONTEND"
  | "AI_DATA"
  | "MOBILE"
  | "CAREER_SWITCH"
  | "EXPLORING";

type PrepStage = "BEGINNER" | "JOB_SEEKING" | "GRADUATING" | "SWITCHING";

/** 카테고리 key 중 인성 면접(PERSONALITY)을 제외한 값 */
type TechTopic =
  | "ALGORITHM_DATA_STRUCTURE"
  | "DATABASE"
  | "NETWORK"
  | "OPERATING_SYSTEM"
  | "JAVA_SPRING"
  | "INFRA"
  | "FRONTEND"
  | "REACT"
  | "JAVASCRIPT_TYPESCRIPT";

type TargetCompanyType = "BIG_TECH" | "SME" | "STARTUP" | "ANY";

type InterviewExperience = "NONE" | "ONE_TO_THREE" | "FOUR_PLUS";

type WeakPoint = "CS" | "PROJECT_QA" | "COMMUNICATION" | "MENTAL";

/**
 * POST /members/me/onboarding-survey 요청 본문
 * 배열 필드는 최소 1개 이상이어야 한다.
 */
interface OnboardingSurveyPayload {
  career_goal: CareerGoal;
  prep_stages: PrepStage[];
  tech_topics: TechTopic[];
  target_company_type: TargetCompanyType;
  interview_experience: InterviewExperience;
  weak_points: WeakPoint[];
  /** 선택 항목, 최대 1000자 */
  goal_description?: string;
}

export type {
  CareerGoal,
  PrepStage,
  TechTopic,
  TargetCompanyType,
  InterviewExperience,
  WeakPoint,
  OnboardingSurveyPayload
};
