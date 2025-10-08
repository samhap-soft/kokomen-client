type ResumeInput = {
  resume: string;
  portfolio?: string;
  job_position: string;
  job_description?: string;
  job_career: string;
};

type ResumeOutput = {
  technical_skills: {
    score: number;
    reason: string;
  };
  project_experience: {
    score: number;
    reason: string;
  };
  problem_solving: {
    score: number;
    reason: string;
  };
  career_growth: {
    score: number;
    reason: string;
  };
  documentation: {
    score: number;
    reason: string;
  };
  total_score: number;
  total_feedback: string;
};

export type { ResumeInput, ResumeOutput };
