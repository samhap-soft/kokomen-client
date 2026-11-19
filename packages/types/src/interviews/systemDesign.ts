import type { AnswerScore } from "./index";

/**
 * 시스템 설계 면접 API 초안.
 *
 * 백엔드 작업 전이라 클라이언트와 MSW 목이 이 계약을 함께 따른다.
 * 필드 이름은 기존 면접 API 와 같이 snake_case 를 쓴다.
 */

/** POST /interviews/system-design → { interview_id } */
type StartSystemDesignInterviewRequest = { difficulty: InterviewDifficulty };

/** 면접 유형. 기본 면접은 기존 API 와 같고, 나머지는 TEXT 전용이다. */
type InterviewKind = "BASIC" | "CODE_REVIEW" | "SYSTEM_DESIGN";

/** 주니어(0~2년) · 미들(3~5년) · 시니어(6년 이상) */
type InterviewDifficulty = "JUNIOR" | "MIDDLE" | "SENIOR";

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
  difficulty: InterviewDifficulty;
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
type SystemDesignAnswerRequest = {
  question_id: number;
  answer: string;
  diagram: SystemDesignDiagram;
};
type SystemDesignAnswerResponse = {
  interview_state: "IN_PROGRESS" | "FINISHED";
  stage: SystemDesignStage;
  cur_answer_rank: AnswerScore;
  next_question_id: number | null;
  next_question: string | null;
};

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
  difficulty: InterviewDifficulty;
  total_score: number;
  total_feedback: string;
  difficulty_comment: string;
  evaluation_points: SystemDesignEvaluationPoint[];
  /** 숨은 요구사항 중 사용자가 묻지 않은 것 */
  missed_requirements: string[];
  requirement_questions: RequirementQuestion[];
  feedbacks: SystemDesignAnswerFeedback[];
  final_diagram: SystemDesignDiagram;
};

export type {
  StartSystemDesignInterviewRequest,
  InterviewKind,
  InterviewDifficulty,
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
  SystemDesignAnswerResponse,
  SystemDesignEvaluationPoint,
  SystemDesignAnswerFeedback,
  SystemDesignReport
};
