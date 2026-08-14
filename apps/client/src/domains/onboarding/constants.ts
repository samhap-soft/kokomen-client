import { OnboardingSurveyPayload } from "@kokomen/types";

/** 주관식(goal_description)은 폼에서 다루지 않는다. */
type OnboardingQuestionKey = Exclude<
  keyof OnboardingSurveyPayload,
  "goal_description"
>;

interface OnboardingOption {
  value: string;
  label: string;
  emoji?: string;
}

interface OnboardingQuestion {
  key: OnboardingQuestionKey;
  /** single: 단수 선택, multiple: 복수 선택 */
  type: "single" | "multiple";
  title: string;
  description: string;
  options: OnboardingOption[];
  /** 데스크탑에서 사용할 그리드 컬럼 수 */
  desktopColumns: 2 | 3;
}

const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    key: "career_goal",
    type: "single",
    title: "어떤 목표로 꼬꼬면을 이용하시나요?",
    description: "선택하신 목표에 맞는 면접을 추천해드려요.",
    desktopColumns: 3,
    options: [
      { value: "BACKEND", label: "백엔드 취업", emoji: "📘" },
      { value: "FRONTEND", label: "프론트엔드 취업", emoji: "💻" },
      { value: "AI_DATA", label: "AI / 데이터", emoji: "🧠" },
      { value: "MOBILE", label: "앱 개발", emoji: "📱" },
      { value: "CAREER_SWITCH", label: "경력 이직", emoji: "💼" },
      { value: "EXPLORING", label: "기타 / 탐색 중", emoji: "🔍" }
    ]
  },
  {
    key: "prep_stages",
    type: "multiple",
    title: "현재 취업 준비 단계는 어디인가요?",
    description: "현재 단계에 맞는 난이도의 면접을 제공해드려요.",
    desktopColumns: 3,
    options: [
      { value: "BEGINNER", label: "개발 입문", emoji: "🌱" },
      { value: "JOB_SEEKING", label: "취업 준비생", emoji: "🎓" },
      { value: "GRADUATING", label: "졸업 예정", emoji: "📅" },
      { value: "SWITCHING", label: "이직 준비 중", emoji: "💼" }
    ]
  },
  {
    key: "tech_topics",
    type: "multiple",
    title: "면접 질문에 포함할 기술/분야를 선택해주세요.",
    description: "선택한 기술에 맞는 기술 면접을 우선 제공해드려요.",
    desktopColumns: 3,
    // 값은 카테고리 key와 동일해야 한다. (인성 면접(PERSONALITY) 제외)
    options: [
      { value: "JAVA_SPRING", label: "자바/스프링" },
      { value: "JAVASCRIPT_TYPESCRIPT", label: "자바스크립트/타입스크립트" },
      { value: "REACT", label: "리액트" },
      { value: "FRONTEND", label: "프론트엔드" },
      { value: "ALGORITHM_DATA_STRUCTURE", label: "알고리즘/자료구조" },
      { value: "DATABASE", label: "데이터베이스" },
      { value: "NETWORK", label: "네트워크" },
      { value: "OPERATING_SYSTEM", label: "운영체제" },
      { value: "INFRA", label: "인프라" }
    ]
  },
  {
    key: "target_company_type",
    type: "single",
    title: "목표로 하는 기업 스타일이 있나요?",
    description: "기업 스타일에 맞는 면접 질문과 피드백을 제공해드려요.",
    desktopColumns: 3,
    options: [
      { value: "BIG_TECH", label: "네/카/라/쿠/배", emoji: "🏢" },
      { value: "SME", label: "중견 / 중소기업", emoji: "🏬" },
      { value: "STARTUP", label: "유니콘 / 스타트업", emoji: "🚀" },
      { value: "ANY", label: "상관없음", emoji: "🙌" }
    ]
  },
  {
    key: "interview_experience",
    type: "single",
    title: "기술 면접 경험이 어느 정도인가요?",
    description: "경험에 맞는 난이도와 피드백 강도를 조절할게요.",
    desktopColumns: 3,
    options: [
      { value: "NONE", label: "처음입니다", emoji: "😀" },
      { value: "ONE_TO_THREE", label: "1 ~ 3회", emoji: "💬" },
      { value: "FOUR_PLUS", label: "4회 이상", emoji: "📊" }
    ]
  },
  {
    key: "weak_points",
    type: "multiple",
    title: "면접에서 취약하다고 느끼는 부분은?",
    description: "선택한 부분을 집중적으로 개선할 수 있도록 도와드려요.",
    desktopColumns: 2,
    options: [
      { value: "CS", label: "CS (컴퓨터 공학 기초)" },
      { value: "PROJECT_QA", label: "프로젝트 설명 / 꼬리질문" },
      { value: "COMMUNICATION", label: "말하기 / 논리적 표현력" },
      { value: "MENTAL", label: "긴장 / 멘탈 관리" }
    ]
  }
];

/** 데스크탑은 한 스텝에 두 문항씩 묶어서 보여준다. */
const DESKTOP_STEPS: OnboardingQuestionKey[][] = [
  ["career_goal", "prep_stages"],
  ["tech_topics", "target_company_type"],
  ["interview_experience", "weak_points"]
];

/** 모바일은 한 스텝에 한 문항씩 보여준다. */
const MOBILE_STEPS: OnboardingQuestionKey[][] = ONBOARDING_QUESTIONS.map(
  (question) => [question.key]
);

const QUESTION_BY_KEY: Record<OnboardingQuestionKey, OnboardingQuestion> =
  ONBOARDING_QUESTIONS.reduce(
    (accumulator, question) => {
      accumulator[question.key] = question;
      return accumulator;
    },
    {} as Record<OnboardingQuestionKey, OnboardingQuestion>
  );

/**
 * 온보딩 페이지 경로를 만든다.
 * 온보딩을 이미 작성한 사용자는 온보딩 페이지에서 redirectTo로 다시 보내진다.
 */
function buildOnboardingPath(redirectTo: string): string {
  return `/onboarding?redirectTo=${encodeURIComponent(redirectTo || "/")}`;
}

export type { OnboardingQuestion, OnboardingQuestionKey, OnboardingOption };
export {
  ONBOARDING_QUESTIONS,
  DESKTOP_STEPS,
  MOBILE_STEPS,
  QUESTION_BY_KEY,
  buildOnboardingPath
};
