import { Dispatch } from "react";

type InterviewStatus = "standby" | "thinking" | "question" | "finished";

type QuestionAndAnswer = {
  question_id: number;
  answer_id: number;
  question: string;
  answer: string;
};
type PrevQuestionAndAnswers = Array<QuestionAndAnswer>;

type Interview = {
  interview_id: number;
  interview_state: "IN_PROGRESS" | "FINISHED";
  prev_questions_and_answers: PrevQuestionAndAnswers;
  cur_question_id: number;
  cur_question_count: number;
  cur_question: string;
  max_question_count: number;
};

type InterviewConfig = {
  category: string;
  max_question_count: number;
  interview_type: InterviewType;
};
type InterviewType = "text" | "voice";
interface InterviewState {
  message: string;
  status: InterviewStatus;
  currentQuestionId: number;
  questionsAndAnswers: Omit<QuestionAndAnswer, "answer_id" | "question_id">[];
}

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
  QuestionAndAnswer,
  PrevQuestionAndAnswers,
  Interview,
  InterviewConfig,
  InterviewType,
  InterviewState,
  InterviewActions
};
