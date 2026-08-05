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

type ResumeEvaluationHistoryItem = {
  id: number;
  state: "PENDING" | "COMPLETED" | "FAILED";
  job_position: string;
  job_career: string;
  total_score: number;
  created_at: string;
};

type ResumeEvaluationsResponse = {
  evaluations: ResumeEvaluationHistoryItem[];
  current_page: number;
  total_resume_evaluation_count: number;
  total_pages: number;
  has_next: boolean;
};

/**
 * 이력서 분석 (POST /resume-analyses)
 * 이력서 평가와 이력서 기반 면접 질문 생성이 하나의 리소스로 합쳐진 API.
 * 평가 -> 질문 생성 순서로 처리되므로 state가 두 단계에 걸쳐 변한다.
 */
type ResumeAnalysisState =
  | "PENDING"
  | "EVALUATION_COMPLETED"
  | "COMPLETED"
  | "EVALUATION_FAILED"
  | "QUESTION_FAILED";

type ResumeAnalysisFile = {
  id: number;
  title: string;
};

// ===== 서버 응답 (snake_case) =====
type ResumeAnalysisCriterionResponse = {
  score: number;
  weight: number;
  reason: string[];
  improvements: string[];
};

type ResumeAnalysisEvaluationResponse = {
  problem_solving: ResumeAnalysisCriterionResponse;
  project_experience: ResumeAnalysisCriterionResponse;
  technical_skills: ResumeAnalysisCriterionResponse;
  soft_skills: ResumeAnalysisCriterionResponse;
  // 채용 공고를 제공했을 때만 포함되는 지표
  jd_fit?: ResumeAnalysisCriterionResponse;
  total_score: number;
  total_feedback: string;
};

type ResumeAnalysisQuestionResponse = {
  generated_question_id: number;
  question_order: number;
  question: string;
  reason: string;
};

type ResumeAnalysisResponse = {
  analysis_id: number;
  state: ResumeAnalysisState;
  jd_provided: boolean;
  interview_available: boolean;
  // QUESTION_FAILED일 때만 포함
  question_retryable?: boolean;
  // 회원이 저장된 자료로 분석했을 때만 포함
  resume?: ResumeAnalysisFile;
  portfolio?: ResumeAnalysisFile;
  job_position: string;
  job_description?: string;
  job_career: string;
  // 평가 완료 이후에만 포함
  evaluation?: ResumeAnalysisEvaluationResponse;
  // COMPLETED에서만 포함
  questions?: ResumeAnalysisQuestionResponse[];
  created_at: string;
};

type ResumeAnalysisSubmitResponse = {
  analysis_id: number;
  // 비회원 제출일 때만 포함 (조회 시 소유 증명에 사용)
  guest_token?: string;
};

// ===== 클라이언트에서 사용하는 형태 (camelCase) =====
// CamelCasedProperties는 optional 중첩 객체와 string[]를 표현하지 못해 직접 선언한다.
type ResumeAnalysisCriterionKey =
  | "technicalSkills"
  | "projectExperience"
  | "problemSolving"
  | "softSkills"
  | "jdFit";

type ResumeAnalysisCriterion = {
  score: number;
  weight: number;
  reason: string[];
  improvements: string[];
};

type ResumeAnalysisEvaluation = {
  problemSolving: ResumeAnalysisCriterion;
  projectExperience: ResumeAnalysisCriterion;
  technicalSkills: ResumeAnalysisCriterion;
  softSkills: ResumeAnalysisCriterion;
  jdFit?: ResumeAnalysisCriterion;
  totalScore: number;
  totalFeedback: string;
};

type ResumeAnalysisQuestion = {
  generatedQuestionId: number;
  questionOrder: number;
  question: string;
  reason: string;
};

type ResumeAnalysis = {
  analysisId: number;
  state: ResumeAnalysisState;
  jdProvided: boolean;
  interviewAvailable: boolean;
  questionRetryable?: boolean;
  resume?: ResumeAnalysisFile;
  portfolio?: ResumeAnalysisFile;
  jobPosition: string;
  jobDescription?: string;
  jobCareer: string;
  evaluation?: ResumeAnalysisEvaluation;
  questions?: ResumeAnalysisQuestion[];
  createdAt: string;
};

type ResumeAnalysisSubmitResult = {
  analysisId: number;
  guestToken?: string;
};

/**
 * 내 이력서 분석 목록 (GET /resume-analyses)
 * 기존 /resumes/evaluations 목록 API를 대체한다.
 */
type ResumeAnalysisListItemResponse = {
  analysis_id: number;
  state: ResumeAnalysisState;
  job_position: string;
  job_career: string;
  jd_provided: boolean;
  // 평가 완료 이후에만 포함
  total_score?: number;
  question_count: number;
  created_at: string;
};

type ResumeAnalysisListResponse = {
  data: ResumeAnalysisListItemResponse[];
  current_page: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
};

type ResumeAnalysisListItem = {
  analysisId: number;
  state: ResumeAnalysisState;
  jobPosition: string;
  jobCareer: string;
  jdProvided: boolean;
  totalScore?: number;
  questionCount: number;
  createdAt: string;
};

type ResumeAnalysisList = {
  data: ResumeAnalysisListItem[];
  currentPage: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
};

/**
 * 이력서 분석 기반 면접 시작 (POST /interviews/resume-analyses/{analysisId})
 * TEXT 모드는 root_question, VOICE 모드는 root_question_voice_url을 반환한다.
 */
type ResumeAnalysisInterviewStartRequest = {
  generated_question_id: number;
  // 3 ~ 20
  max_question_count: number;
  mode: "TEXT" | "VOICE";
};

type ResumeAnalysisInterviewStartResponse = {
  interview_id: number;
  question_id: number;
  root_question?: string;
  root_question_voice_url?: string;
};

type ResumeAnalysisInterviewStartResult = {
  interviewId: number;
  questionId: number;
  rootQuestion?: string;
  rootQuestionVoiceUrl?: string;
};

export type {
  ResumeInput,
  ResumeOutput,
  ArchivedResumeAndPortfolio,
  ResumePending,
  ResumeInputWithArchivedFile,
  ResumeInputWithNewFile,
  ResumeFailed,
  ResumeEvaluationResult,
  ResumeEvaluationHistoryItem,
  ResumeEvaluationsResponse,
  ResumeAnalysisState,
  ResumeAnalysisFile,
  ResumeAnalysisCriterionResponse,
  ResumeAnalysisEvaluationResponse,
  ResumeAnalysisQuestionResponse,
  ResumeAnalysisResponse,
  ResumeAnalysisSubmitResponse,
  ResumeAnalysisCriterionKey,
  ResumeAnalysisCriterion,
  ResumeAnalysisEvaluation,
  ResumeAnalysisQuestion,
  ResumeAnalysis,
  ResumeAnalysisSubmitResult,
  ResumeAnalysisInterviewStartRequest,
  ResumeAnalysisInterviewStartResponse,
  ResumeAnalysisInterviewStartResult,
  ResumeAnalysisListItemResponse,
  ResumeAnalysisListResponse,
  ResumeAnalysisListItem,
  ResumeAnalysisList
};
