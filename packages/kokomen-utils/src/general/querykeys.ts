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

interface InterviewHistoryMethods {
  infinite: (
    filters: [InterviewHistoryParams["sort"], InterviewHistoryParams["range"]]
  ) => QueryKey;
}
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

interface InterviewMethods {
  byInterviewId: (id: number) => QueryKey;
  byInterviewIdAndQuestionId: (id: number, questionId: number) => QueryKey;
  resultByInterviewId: (id: number) => QueryKey;
}
const interviewKeys: QueryKeyFactory<InterviewMethods> = {
  all: ["interview"] as const,
  byInterviewId: (id: number): QueryKey => [...interviewKeys.all, id] as const,
  byInterviewIdAndQuestionId: (id: number, questionId: number): QueryKey =>
    [...interviewKeys.all, id, questionId] as const,
  resultByInterviewId: (id: number): QueryKey =>
    [...interviewKeys.all, "result", id] as const
};

// 멤버 관련 도메인
interface MemberRankParams {
  page: number;
  size: number;
}
interface MemberMethods {
  rank: (page?: number, size?: number) => QueryKey;
  interviewsByIdAndPage: (
    id: number,
    sort: "asc" | "desc",
    page?: number
  ) => QueryKey;
  infiniteInterviewHistory: (filters: ["asc" | "desc", number]) => QueryKey;
}
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
  infiniteInterviewHistory: (filters: ["asc" | "desc", number]) =>
    [...memberKeys.all, "interviewHistory", "infinite", ...filters] as const
};

interface MeMethods {
  me: () => QueryKey;
  streak: () => QueryKey;
  detailedInfo: () => QueryKey;
}
const meKeys: QueryKeyFactory<MeMethods> = {
  all: ["me"] as const,
  me: (): QueryKey => [...meKeys.all] as const,
  streak: (): QueryKey => [...meKeys.all, "streak"] as const,
  detailedInfo: (): QueryKey => [...meKeys.all, "detailedInfo"] as const
};

interface NotificationMethods {
  infiniteReadNotifications: () => QueryKey;
  infiniteUnreadNotifications: () => QueryKey;
}
const notificationKeys: QueryKeyFactory<NotificationMethods> = {
  all: ["notifications"] as const,
  infiniteReadNotifications: (): QueryKey =>
    [...notificationKeys.all, "read", "infinite"] as const,
  infiniteUnreadNotifications: (): QueryKey =>
    [...notificationKeys.all, "unread", "infinite"] as const
};

interface PurchaseMethods {
  purchaseHistory: (page: number) => QueryKey;
}
const purchaseKeys: QueryKeyFactory<PurchaseMethods> = {
  all: ["purchase"] as const,
  purchaseHistory: (page: number) => [...purchaseKeys.all, page] as const
};

export {
  interviewHistoryKeys,
  interviewKeys,
  memberKeys,
  meKeys,
  notificationKeys,
  purchaseKeys,
  type InterviewHistoryParams,
  type InterviewParams,
  type MemberRankParams,
  type MeMethods,
  type NotificationMethods,
  type PurchaseMethods
};
