interface PrivateFeedback {
  question_id: number;
  answer_id: number;
  question: string;
  answer: string;
  answer_rank: string;
  answer_feedback: string;
  temp_answer_memo_content: string;
  submitted_answer_memo_content: string;
  answer_memo_visibility: "PUBLIC" | "PRIVATE" | "FRIENDS";
}
interface InterviewReport {
  feedbacks: PrivateFeedback[];
  total_feedback: string;
  total_score: number;
  user_cur_score: number;
  user_prev_score: number;
  user_cur_rank: string;
  user_prev_rank: string;
}

type AnswerMemo = {
  visibility: "PUBLIC" | "PRIVATE" | "FRIENDS";
  content: string;
};

export type { PrivateFeedback, InterviewReport, AnswerMemo };
