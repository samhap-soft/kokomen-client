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
  byInterviewId: (id: number) => QueryKey;
  byInterviewIdAndQuestionId: (id: number, questionId: number) => QueryKey;
};
const interviewKeys: QueryKeyFactory<InterviewMethods> = {
  all: ["interview"] as const,
  byInterviewId: (id: number): QueryKey => [...interviewKeys.all, id] as const,
  byInterviewIdAndQuestionId: (id: number, questionId: number): QueryKey =>
    [...interviewKeys.all, id, questionId] as const
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
};
const resumeBasedInterviewKeys: QueryKeyFactory<ResumeBasedInterviewMethods> = {
  all: ["resumeBasedInterview"] as const,
  generations: (page: number = 0): QueryKey =>
    [...resumeBasedInterviewKeys.all, "generations", page] as const
};

type ResumeEvaluationMethods = {
  history: (page?: number, size?: number) => QueryKey;
};
const resumeEvaluationKeys: QueryKeyFactory<ResumeEvaluationMethods> = {
  all: ["resumeEvaluation"] as const,
  history: (page: number = 0, size: number = 20): QueryKey =>
    [...resumeEvaluationKeys.all, "history", page, size] as const
};

export {
  interviewHistoryKeys,
  interviewKeys,
  memberKeys,
  archiveKeys,
  purchaseKeys,
  recruitKeys,
  resumeBasedInterviewKeys,
  resumeEvaluationKeys,
  type InterviewHistoryParams,
  type InterviewParams,
  type MemberRankParams,
  type RecruitMethods,
  type ArchiveMethods,
  type ResumeBasedInterviewMethods,
  type ResumeEvaluationMethods
};
