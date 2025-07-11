type Rank = {
  id: number;
  nickname: string;
  score: number;
  finished_interview_count: number;
};

type InterviewSummary = {
  interview_id: number;
  interview_category: string;
  created_at: string;
  root_question: string;
  max_question_count: number;
  score: 20;
  interview_view_count: number;
  interview_like_count: number;
  interview_already_liked: boolean;
};

type MemberInterview = {
  interview_summaries: InterviewSummary[];
  total_member_count: number;
  interviewee_rank: number;
  interviewee_nickname: string;
  total_page_count: number;
};

type Feedback = {
  question_id: number;
  answer_id: number;
  question: string;
  answer: string;
  answer_rank: string;
  answer_feedback: string;
  answer_like_count: number;
  answer_already_liked: boolean;
};

type MemberInterviewResult = {
  feedbacks: Feedback[];
  total_feedback: string;
  total_score: number;
  interview_like_count: number;
  interview_already_liked: boolean;
  interviewee_rank: number;
  total_member_count: number;
  interviewee_nickname: string;
};

export type { Feedback, Rank, MemberInterview, MemberInterviewResult };
