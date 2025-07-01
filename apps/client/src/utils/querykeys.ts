const interviewHistoryKeys = {
  all: ["interviewHistory"] as const,
  infinite: (filters: string[]) =>
    [...interviewHistoryKeys.all, "infinite", ...filters] as const,
};

export { interviewHistoryKeys };
