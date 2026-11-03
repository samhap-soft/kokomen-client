const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

/** Figma 목록 · 리포트에서 쓰는 `2026.08.21` 형식 */
const formatDotDate = (date: string): string => {
  const d = new Date(date);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
};

export { formatDate, formatDotDate };
