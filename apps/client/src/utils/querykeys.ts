const interviewHistoryKeys = {
  all: ["interviewHistory"] as const,
  infinite: (filters: string[]) =>
    [...interviewHistoryKeys.all, "infinite", ...filters] as const,
};

const interviewKeys = {
  all: ["interview"] as const,
  byInterviewId: (id: number) => [...interviewKeys.all, id] as const,
  byInterviewIdAndQuestionId: (id: number, questionId: number) =>
    [...interviewKeys.byInterviewId(id), questionId] as const,
};

export { interviewHistoryKeys, interviewKeys };
