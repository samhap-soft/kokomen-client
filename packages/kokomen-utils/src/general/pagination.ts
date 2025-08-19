export const getVisiblePageNumbers = (
  currentPage: number,
  totalPages: number,
  maxButtons: number
) => {
  const pages: number[] = [];
  const halfMaxButtons = Math.floor(maxButtons / 2);

  let startPage = Math.max(0, currentPage - halfMaxButtons);
  let endPage = Math.min(totalPages - 1, currentPage + halfMaxButtons);

  // 시작 또는 끝에 도달했을 때 조정
  if (endPage - startPage < maxButtons - 1) {
    if (startPage === 0) {
      endPage = Math.min(totalPages - 1, maxButtons - 1);
    } else {
      startPage = Math.max(0, totalPages - maxButtons);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
};
