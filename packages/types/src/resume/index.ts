type ArchivedResumeAndPortfolio = {
  id: number;
  title: string;
  url: string;
  created_at: string;
};

type ResumeInput = ResumeInputWithNewFile | ResumeInputWithArchivedFile;

type ResumeInputWithNewFile = {
  resume: File;
  portfolio?: File;
  job_position: string;
  job_description?: string;
  job_career: string;
};

type ResumeInputWithArchivedFile = {
  resume_id: string;
  portfolio_id?: string;
  job_position: string;
  job_description?: string;
  job_career: string;
};

type ResumePending = {
  state: "PENDING";
};
type ResumeFailed = {
  state: "FAILED";
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

type ResumeEvaluationResult = {
  id: number;
  resume: {
    id: number;
    title: string;
  };
  portfolio: {
    id: number;
    title: string;
  };
  job_position: string;
  job_description: string;
  job_career: string;
  result: ResumeOutput["result"];
};
export type {
  ResumeInput,
  ResumeOutput,
  ArchivedResumeAndPortfolio,
  ResumePending,
  ResumeInputWithArchivedFile,
  ResumeInputWithNewFile,
  ResumeFailed,
  ResumeEvaluationResult
};
