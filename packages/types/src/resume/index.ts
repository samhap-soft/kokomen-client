type ArchivedResumeAndPortfolio = {
  id: number;
  title: string;
  url: string;
  created_at: string;
};

type ResumeInput = {
  resume: File;
  portfolio?: File;
  job_position: string;
  job_description?: string;
  job_career: string;
};

type ResumePending = {
  state: "PENDING";
};
type ResumeOutput = {
  state: "COMPLETED";
  result: {
    technical_skills: {
      score: number;
      reason: string;
      improvements: string;
    };
    project_experience: {
      score: number;
      reason: string;
      improvements: string;
    };
    problem_solving: {
      score: number;
      reason: string;
      improvements: string;
    };
    career_growth: {
      score: number;
      reason: string;
      improvements: string;
    };
    documentation: {
      score: number;
      reason: string;
      improvements: string;
    };
    total_score: number;
    total_feedback: string;
  };
};

export type {
  ResumeInput,
  ResumeOutput,
  ArchivedResumeAndPortfolio,
  ResumePending
};
