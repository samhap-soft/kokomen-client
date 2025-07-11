const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "numeric",
  });
};

export { formatDate };
