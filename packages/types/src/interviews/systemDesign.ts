import type { AnswerScore } from "./index";

/**
 * 시스템 설계 면접 API 초안.
 *
 * 백엔드 작업 전이라 클라이언트와 MSW 목이 이 계약을 함께 따른다.
 * 필드 이름은 기존 면접 API 와 같이 snake_case 를 쓴다.
 */

/** POST /interviews/system-design (본문 없음) → { interview_id } */
type StartSystemDesignInterviewResponse = { interview_id: number };

/** 면접 유형. 면접 기록 목록(interview_type)에 같은 값이 온다 */
type InterviewType =
  | "CATEGORY_BASED"
  | "RESUME_BASED"
  | "LIVE_CODING"
  | "PERSONALITY"
  | "SYSTEM_DESIGN";

/**
 * 현재 질문에 낸 답변의 채점 상태.
 * NONE: 내지 않았거나 기록이 사라짐, LLM_PENDING: 채점 중, LLM_FAILED: 실패(같은 질문에 다시 낸다)
 */
type SystemDesignAnswerProceedState = "NONE" | "LLM_PENDING" | "LLM_FAILED";

/**
 * 시스템 설계 면접 난이도. 지금은 BASIC 하나만 연다.
 * 난이도가 늘어도 응답 구조가 바뀌지 않도록 응답에는 지금부터 넣는다.
 */
type SystemDesignDifficulty = "BASIC";

/** 요구사항 → 개략 설계 → 심화 */
type SystemDesignStage = "REQUIREMENTS" | "HIGH_LEVEL" | "DEEP_DIVE";

/** 팔레트에 있는 블록 종류. 목록에 없는 블록은 CUSTOM 으로 만든다. */
type DiagramBlockKind =
  | "CLIENT"
  | "LOAD_BALANCER"
  | "API_SERVER"
  | "DB"
  | "CACHE"
  | "QUEUE"
  | "STORAGE"
  | "CDN"
  | "CUSTOM";

type DiagramBlockProp = {
  key: string;
  value: string;
};

type DiagramBlock = {
  id: string;
  kind: DiagramBlockKind;
  label: string;
  props: DiagramBlockProp[];
  /** 화면 복원용 좌표. LLM 에 보내는 텍스트에는 쓰지 않는다. */
  position: { x: number; y: number };
};

/** 방향이 있는 연결. source → target */
type DiagramConnection = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

/** 저장 · 제출용 다이어그램. React Flow 의 viewport 같은 화면 상태는 넣지 않는다. */
type SystemDesignDiagram = {
  blocks: DiagramBlock[];
  connections: DiagramConnection[];
};

type SystemDesignTopic = {
  title: string;
  description: string;
};

/** 요구사항 단계의 역질문과 면접관 답변 */
type RequirementQuestion = {
  question: string;
  answer: string;
};

type SystemDesignAnswer = {
  question_id: number;
  stage: Exclude<SystemDesignStage, "REQUIREMENTS">;
  question: string;
  answer: string;
  diagram: SystemDesignDiagram;
};

/** GET /interviews/system-design/{interviewId} */
type SystemDesignInterview = {
  interview_id: number;
  interview_type: "SYSTEM_DESIGN";
  interview_state: "IN_PROGRESS" | "FINISHED";
  difficulty: SystemDesignDifficulty;
  topic: SystemDesignTopic;
  stage: SystemDesignStage;
  requirement_questions: RequirementQuestion[];
  max_requirement_question_count: number;
  /** 요구사항 단계에서는 null 이다. */
  cur_question_id: number | null;
  cur_question: string | null;
  prev_questions_and_answers: SystemDesignAnswer[];
  /** 면접관이 질문하고 사용자가 답을 제출한 횟수. 역질문은 넣지 않는다. */
  cur_question_count: number;
  max_question_count: number;
  /** 마지막으로 제출한 다이어그램. 제출 전에는 시작 다이어그램이다. */
  diagram: SystemDesignDiagram;
  /** 현재 질문이 없는 요구사항 단계와 면접이 끝난 뒤에는 키가 없다 */
  cur_answer_proceed_state?: SystemDesignAnswerProceedState;
};

/** POST /interviews/system-design/{interviewId}/requirement-questions */
type RequirementQuestionRequest = { question: string };
type RequirementQuestionResponse = RequirementQuestion & {
  remaining_count: number;
};

/** POST /interviews/system-design/{interviewId}/requirements/complete */
type CompleteRequirementsResponse = {
  stage: "HIGH_LEVEL";
  cur_question_id: number;
  cur_question: string;
};

/** POST /interviews/system-design/{interviewId}/answers */
/**
 * POST /interviews/system-design/{interviewId}/questions/{questionId}/answers → 202
 * 평가는 기존 면접처럼 비동기로 하고, 결과는 SystemDesignAnswerPolling 으로 조회한다.
 */
type SystemDesignAnswerRequest = {
  answer: string;
  diagram: SystemDesignDiagram;
};
type SystemDesignAnswerResult = {
  interview_state: "IN_PROGRESS" | "FINISHED";
  stage: SystemDesignStage;
  cur_answer_rank: AnswerScore;
  next_question_id: number | null;
  next_question: string | null;
};

/** GET /interviews/system-design/{interviewId}/questions/{questionId}. TEXT 전용이라 TTS 상태는 없다 */
type SystemDesignAnswerPolling =
  | { proceed_state: "LLM_PENDING" }
  | { proceed_state: "LLM_FAILED" }
  | ({ proceed_state: "COMPLETED" } & SystemDesignAnswerResult);

type SystemDesignEvaluationPoint = {
  description: string;
  is_met: boolean;
};

type SystemDesignAnswerFeedback = SystemDesignAnswer & {
  answer_rank: AnswerScore;
  answer_feedback: string;
};

/** GET /interviews/system-design/{interviewId}/report */
type SystemDesignReport = {
  interview_id: number;
  topic: SystemDesignTopic;
  difficulty: SystemDesignDifficulty;
  total_score: number;
  total_feedback: string;
  difficulty_comment: string;
  evaluation_points: SystemDesignEvaluationPoint[];
  /** 숨은 요구사항 중 사용자가 묻지 않은 것 */
  missed_requirements: string[];
  requirement_questions: RequirementQuestion[];
  feedbacks: SystemDesignAnswerFeedback[];
  final_diagram: SystemDesignDiagram;
  /** 회원 점수(랭킹). prev 는 이번 면접의 등급 점수 합을 뺀 값이다. total_score 와 다르다 */
  user_cur_score: number;
  user_prev_score: number;
};

export type {
  StartSystemDesignInterviewResponse,
  InterviewType,
  SystemDesignAnswerProceedState,
  SystemDesignDifficulty,
  SystemDesignStage,
  DiagramBlockKind,
  DiagramBlockProp,
  DiagramBlock,
  DiagramConnection,
  SystemDesignDiagram,
  SystemDesignTopic,
  RequirementQuestion,
  SystemDesignAnswer,
  SystemDesignInterview,
  RequirementQuestionRequest,
  RequirementQuestionResponse,
  CompleteRequirementsResponse,
  SystemDesignAnswerRequest,
  SystemDesignAnswerResult,
  SystemDesignAnswerPolling,
  SystemDesignEvaluationPoint,
  SystemDesignAnswerFeedback,
  SystemDesignReport
};
