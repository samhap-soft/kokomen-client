type InterviewHistory = {
  interview_id: number;
  interview_state: "FINISHED" | "IN_PROGRESS";
  interview_category: string;
  created_at: string;
  root_question: string;
  max_question_count: number;
  cur_answer_count: number;
  score: number;
  interview_view_count: number;
  interview_like_count: number;
};

export type { InterviewHistory };
