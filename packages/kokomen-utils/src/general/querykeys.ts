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
    [...interviewHistoryKeys.all, "infinite", ...filters] as const,
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
    [...interviewKeys.all, id, questionId] as const,
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
    [...memberKeys.all, "interviews", interviewId, sort, page] as const,
};

export {
  interviewHistoryKeys,
  interviewKeys,
  memberKeys,
  type InterviewHistoryParams,
  type InterviewParams,
  type MemberRankParams,
};
