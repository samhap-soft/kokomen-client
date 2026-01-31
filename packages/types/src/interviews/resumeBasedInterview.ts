import { InterviewMode } from ".";
import { Paginated } from "../utils";

type CreateResumeBasedInterview = {
  generated_question_id: number;
  max_question_count: number;
  mode: InterviewMode;
};

type ResumeBasedInterviewQuestion = {
  id: number;
  question: string;
};

type ResumeInterviewPending = {
  state: "PENDING";
};
type ResumeInterviewFailed = {
  state: "FAILED";
};
type ResumeInterviewSuccess = {
  state: "COMPLETED";
};

type ResumeBasedInterviewGeneration = {
  id: number;
  job_career: string;
  state: "PENDING" | "COMPLETED" | "FAILED";
  created_at: string;
  resume: {
    name: string;
    url: string;
  } | null;
  portfolio: {
    name: string;
    url: string;
  } | null;
};

type ResumeBasedInterviewGenerationsResponse = Paginated<
  ResumeBasedInterviewGeneration[]
>;

export type {
  CreateResumeBasedInterview,
  ResumeBasedInterviewQuestion,
  ResumeInterviewPending,
  ResumeInterviewFailed,
  ResumeInterviewSuccess,
  ResumeBasedInterviewGeneration,
  ResumeBasedInterviewGenerationsResponse
};
