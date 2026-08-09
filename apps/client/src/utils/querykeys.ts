import { RecruitFilterRequest } from "@kokomen/types";

/* eslint-disable no-unused-vars */
type QueryKey = readonly (string | number)[];

type QueryKeyFactory<T> = {
  readonly all: QueryKey;
} & {
  [K in keyof T]: T[K] extends (...args: any[]) => QueryKey
    ? (...args: Parameters<T[K]>) => QueryKey
    : QueryKey;
};

// 인터뷰 히스토리 관련 도메인
interface InterviewHistoryParams {
  sort: "asc" | "desc";
  range: "IN_PROGRESS" | "FINISHED" | "ALL";
}

type InterviewHistoryMethods = {
  infinite: (
    filters: [InterviewHistoryParams["sort"], InterviewHistoryParams["range"]]
  ) => QueryKey;
};
const interviewHistoryKeys: QueryKeyFactory<InterviewHistoryMethods> = {
  all: ["interviewHistory"] as const,
  infinite: (filters: string[]): QueryKey =>
    [...interviewHistoryKeys.all, "infinite", ...filters] as const
};

// 인터뷰 관련 도메인
interface InterviewParams {
  interviewId: number;
  questionId?: number;
}

type InterviewMethods = {
  byInterviewId: (id: number | string) => QueryKey;
  byInterviewIdAndQuestionId: (id: number, questionId: number) => QueryKey;
};
const interviewKeys: QueryKeyFactory<InterviewMethods> = {
  all: ["interview"] as const,
  byInterviewId: (id: number | string): QueryKey =>
    [...interviewKeys.all, id] as const,
  byInterviewIdAndQuestionId: (id: number, questionId: number): QueryKey =>
    [...interviewKeys.all, id, questionId] as const
};

// 인터뷰 루트 질문 관련 도메인
type InterviewQuestionMethods = {
  byCategory: (category: string) => QueryKey;
};
const interviewQuestionKeys: QueryKeyFactory<InterviewQuestionMethods> = {
  all: ["interviewQuestions"] as const,
  byCategory: (category: string): QueryKey =>
    [...interviewQuestionKeys.all, category] as const
};

// 멤버 관련 도메인
interface MemberRankParams {
  page: number;
  size: number;
}
type MemberMethods = {
  rank: (page?: number, size?: number) => QueryKey;
  interviewsByIdAndPage: (
    id: number,
    sort: "asc" | "desc",
    page?: number
  ) => QueryKey;
};
const memberKeys: QueryKeyFactory<MemberMethods> = {
  all: ["members"] as const,
  rank: (page: number = 0): QueryKey =>
    [...memberKeys.all, "rank", page] as const,
  interviewsByIdAndPage: (
    interviewId: number,
    sort: "asc" | "desc",
    page: number = 0
  ): QueryKey =>
    [...memberKeys.all, "interviews", interviewId, sort, page] as const
};

// 구매 관련 도메인
type PurchaseMethods = {
  purchaseHistory: () => QueryKey;
};
const purchaseKeys: QueryKeyFactory<PurchaseMethods> = {
  all: ["purchase"] as const,
  purchaseHistory: (): QueryKey => [...purchaseKeys.all, "history"] as const
};

type RecruitMethods = {
  list: (filters: RecruitFilterRequest) => QueryKey;
};
const recruitKeys: QueryKeyFactory<RecruitMethods> = {
  all: ["recruit"] as const,
  list: (filters: RecruitFilterRequest): QueryKey =>
    [
      ...recruitKeys.all,
      "list",
      JSON.stringify({
        region: [...filters.region].sort(),
        employeeType: [...filters.employeeType].sort(),
        education: [...filters.education].sort(),
        employment: [...filters.employment].sort(),
        deadlineType: [...filters.deadlineType].sort(),
        careerMin: filters.careerMin,
        careerMax: filters.careerMax
      })
    ] as const
};

type ArchiveMethods = {
  resumes: (type?: "ALL" | "RESUME" | "PORTFOLIO") => QueryKey;
};
const archiveKeys: QueryKeyFactory<ArchiveMethods> = {
  all: ["archive"] as const,
  resumes: (type?: "ALL" | "RESUME" | "PORTFOLIO"): QueryKey =>
    [...archiveKeys.all, "resumes", type ?? "ALL"] as const
};

type ResumeBasedInterviewMethods = {
  generations: (page?: number) => QueryKey;
  infinite: () => QueryKey;
};
const resumeBasedInterviewKeys: QueryKeyFactory<ResumeBasedInterviewMethods> = {
  all: ["resumeBasedInterview"] as const,
  generations: (page: number = 0): QueryKey =>
    [...resumeBasedInterviewKeys.all, "generations", page] as const,
  infinite: (): QueryKey =>
    [...resumeBasedInterviewKeys.all, "infinite"] as const
};

// 이력서 분석(평가 + 면접 질문 통합 API) 도메인
type ResumeAnalysisMethods = {
  history: (page?: number, size?: number) => QueryKey;
  detail: (analysisId: number | string) => QueryKey;
};
const resumeAnalysisKeys: QueryKeyFactory<ResumeAnalysisMethods> = {
  all: ["resumeAnalysis"] as const,
  history: (page: number = 0, size: number = 20): QueryKey =>
    [...resumeAnalysisKeys.all, "history", page, size] as const,
  detail: (analysisId: number | string): QueryKey =>
    [...resumeAnalysisKeys.all, "detail", analysisId] as const
};

// 관리자 결제 관련 도메인
type AdminPaymentMethods = {
  list: (page?: number) => QueryKey;
};
const adminPaymentKeys: QueryKeyFactory<AdminPaymentMethods> = {
  all: ["adminPayments"] as const,
  list: (page: number = 0): QueryKey =>
    [...adminPaymentKeys.all, "list", page] as const
};

// 관리자 질문 관련 도메인
type AdminQuestionMethods = {
  byCategory: (category: string) => QueryKey;
};
const adminQuestionKeys: QueryKeyFactory<AdminQuestionMethods> = {
  all: ["adminQuestions"] as const,
  byCategory: (category: string): QueryKey =>
    [...adminQuestionKeys.all, category] as const
};

export {
  interviewHistoryKeys,
  interviewKeys,
  interviewQuestionKeys,
  memberKeys,
  archiveKeys,
  purchaseKeys,
  recruitKeys,
  resumeBasedInterviewKeys,
  resumeAnalysisKeys,
  adminQuestionKeys,
  adminPaymentKeys,
  type InterviewHistoryParams,
  type InterviewParams,
  type MemberRankParams,
  type RecruitMethods,
  type ArchiveMethods,
  type ResumeBasedInterviewMethods,
  type ResumeAnalysisMethods,
  type AdminQuestionMethods,
  type AdminPaymentMethods,
  type InterviewQuestionMethods
};
