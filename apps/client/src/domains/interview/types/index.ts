type InterviewStatus = "standby" | "thinking" | "question" | "finished";

type QuestionAndAnswer = {
  question_id: number;
  answer_id: number;
  question: string;
  answer: string;
};
type PrevQuestionAndAnswers = Array<QuestionAndAnswer>;

type Interview = {
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

export type {
  InterviewStatus,
  QuestionAndAnswer,
  PrevQuestionAndAnswers,
  Interview,
  InterviewConfig,
  InterviewType,
};
