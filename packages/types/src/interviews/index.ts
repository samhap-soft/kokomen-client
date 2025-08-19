import { Dispatch } from "react";

type InterviewStatus = "standby" | "thinking" | "question" | "finished";
type AnswerScore = "A" | "B" | "C" | "D" | "F";

type InterviewerEmotion = "happy" | "encouraging" | "angry" | "neutral";

type QuestionAndAnswer = {
  question_id: number;
  answer_id: number;
  question: string;
  answer: string;
};
type PrevQuestionAndAnswers = Array<QuestionAndAnswer>;

type BaseInterview = {
  interview_id: number;
  interview_state: "IN_PROGRESS" | "FINISHED";
  prev_questions_and_answers: PrevQuestionAndAnswers;
  cur_question_id: number;
  cur_question_count: number;
  max_question_count: number;
};

type TextInterview = BaseInterview & {
  cur_question: string;
};

type VoiceInterview = BaseInterview & {
  cur_question_voice_url: string;
};
type InterviewMode = "TEXT" | "VOICE";
type Interview = TextInterview | VoiceInterview;

type InterviewConfig = {
  category: string;
  max_question_count: number;
  interview_type: InterviewMode;
};
interface InterviewState {
  message: string;
  status: InterviewStatus;
  currentQuestionId: number;
  questionsAndAnswers: Omit<QuestionAndAnswer, "answer_id" | "question_id">[];
}

type InterviewAnswerForm = {
  interviewId: number;
  questionId: number;
  answer: string;
  mode: InterviewMode;
};

type ProceedState =
  | "LLM_PENDING"
  | "LLM_FAILED"
  | "TTS_PENDING"
  | "TTS_FAILED"
  | "COMPLETED";

// Polling중 기본적으로 가지고 있는 필드
type BaseTextInterviewSubmitStatus = {
  proceed_state: ProceedState;
};

// LLM과 TTS 모두 성공한 경우
type InterviewSubmitPollingSuccess = BaseTextInterviewSubmitStatus & {
  proceed_state: ProceedState;
  interview_state: "FINISHED";
  cur_answer_rank: AnswerScore;
  next_question_id: number;
  next_question_voice_url?: string;
  next_question?: string;
};

// LLM 폴링 중
type InterviewSubmitPollingLLMPending = BaseTextInterviewSubmitStatus & {
  proceed_state: "LLM_PENDING";
};

// LLM 폴링 중 실패한 경우
type InterviewSubmitPollingLLMFailed = BaseTextInterviewSubmitStatus & {
  proceed_state: "LLM_FAILED";
};

// TTS 폴링 중
type InterviewSubmitPollingTTSPending = BaseTextInterviewSubmitStatus & {
  proceed_state: "TTS_PENDING";
};

// TTS 폴링 중 실패한 경우
type InterviewSubmitPollingTTSFailed = BaseTextInterviewSubmitStatus & {
  proceed_state: "TTS_FAILED";
};

type InterviewSubmitPolling =
  | InterviewSubmitPollingSuccess
  | InterviewSubmitPollingLLMPending
  | InterviewSubmitPollingLLMFailed
  | InterviewSubmitPollingTTSPending
  | InterviewSubmitPollingTTSFailed;

// Interview 관련 reducer 액션 타입
type InterviewActions = Dispatch<InterviewAction>;

interface StartupAction {
  type: "START_UP";
}
interface AnswerQuestionAction {
  type: "ANSWER_QUESTION";
}
interface InterviewEndAction {
  type: "INTERVIEW_END";
}
interface SubmitFailedAction {
  type: "SUBMIT_FAILED";
}
interface QuestionAction {
  type: "QUESTION";
  message: string;
  currentQuestionId: number;
}

interface NextQuestionAction {
  type: "NEXT_QUESTION";
  message: string;
  currentQuestionId: number;
  prevAnswer: string;
}
type InterviewAction =
  | StartupAction
  | AnswerQuestionAction
  | InterviewEndAction
  | SubmitFailedAction
  | NextQuestionAction
  | QuestionAction;

export type {
  InterviewStatus,
  InterviewerEmotion,
  QuestionAndAnswer,
  PrevQuestionAndAnswers,
  Interview,
  InterviewConfig,
  InterviewState,
  InterviewActions,
  InterviewMode,
  InterviewSubmitPolling,
  InterviewSubmitPollingSuccess,
  InterviewAnswerForm,
  ProceedState,
  AnswerScore
};
