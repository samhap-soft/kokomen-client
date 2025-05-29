interface Feedback {
  question_id: number;
  answer_id: number;
  question: string;
  answer: string;
  answer_rank: string;
  answer_feedback: string;
}
interface InterviewReport {
  feedbacks: Feedback[];
  total_feedback: string;
  total_score: number;
  user_cur_score: number;
  user_prev_score: number;
  user_cur_rank: string;
  user_prev_rank: string;
}

export type { Feedback, InterviewReport };
