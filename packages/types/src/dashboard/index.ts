import { InterviewMode } from "../interviews";

type InterviewHistory = {
  interview_id: number;
  interview_state: "FINISHED" | "IN_PROGRESS";
  interview_category: string;
  interview_mode: InterviewMode;
  created_at: string;
  root_question: string;
  max_question_count: number;
  cur_answer_count: number;
  score: number;
  interview_view_count: number;
  interview_like_count: number;
  interview_already_liked: boolean;
  submitted_answer_memo_count: number;
  has_temp_answer_memo: boolean;
};

type DailyStreak = {
  date: string;
  count: number;
};
type Streak = {
  daily_counts: DailyStreak[];
  max_streak: number;
  current_streak: number;
};
export type { InterviewHistory, Streak };
