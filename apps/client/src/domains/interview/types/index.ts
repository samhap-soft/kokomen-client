type InterviewStatus = "standby" | "thinking" | "question" | "finished";

type QuestionAndAnswer = {
  question_id: number;
  answer_id: number;
  question: string;
  answer: string;
};
type PrevQuestionAndAnswers = Array<QuestionAndAnswer>;

type PrevInterview = {
  interview_state: "FINISHED" | "IN_PROGRESS";
  prev_question_and_answers: PrevQuestionAndAnswers;
  cur_question_id: number;
  question: string;
  cur_question_count: number;
  max_question_count: number;
};

export type { InterviewStatus, PrevQuestionAndAnswers, PrevInterview };
