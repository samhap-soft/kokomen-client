import { JSX } from "react";
import { cn } from "../../utils/index.ts";
import { ChevronLeftIcon, ChevronRightIcon } from "../icon";

/**
 * Figma: Common/Pagination — component set 752:200
 * (Pagination / Item 752:22, Pagination / Navigation 752:47)
 *
 * 28px 정사각 버튼 · radius 4 · 숫자 사이 간격 4 · 화살표와 숫자 사이 간격 10.
 * 선택된 번호는 stroke/primary-light 테두리 + onsurface/brand 글자,
 * 이동할 페이지가 없는 화살표는 opacity 35% 로 비활성화한다.
 *
 * `totalPages` 를 모르는 목록(전체 개수를 주지 않는 API)은 생략한다.
 * 이때는 현재 번호 하나와 이전/다음 화살표만 그리고, 다음 페이지 여부는 `hasNext` 로 받는다.
 */
export interface IPaginationProps {
  /** 0 부터 시작하는 현재 페이지 */
  currentPage: number;
  totalPages?: number;
  /** `totalPages` 가 없을 때 다음 화살표를 켤지 정한다 */
  hasNext?: boolean;
  /** 한 번에 보여줄 번호 개수 */
  maxVisible?: number;
  // eslint-disable-next-line no-unused-vars
  onPageChange: (page: number) => void;
  className?: string;
}

const itemClassName: string =
  "flex size-7 items-center justify-center rounded border border-border bg-bg-base text-base font-medium text-text-secondary transition-colors hover:bg-fill-quaternary disabled:pointer-events-none";

const getVisiblePages = (
  currentPage: number,
  totalPages: number,
  maxVisible: number
): number[] => {
  const count = Math.min(maxVisible, totalPages);
  const start = Math.min(
    Math.max(currentPage - Math.floor(count / 2), 0),
    totalPages - count
  );
  return Array.from({ length: count }, (_, index) => start + index);
};

export const Pagination = ({
  currentPage,
  totalPages,
  hasNext,
  maxVisible = 5,
  onPageChange,
  className
}: IPaginationProps): JSX.Element => {
  const pages =
    totalPages === undefined
      ? [currentPage]
      : getVisiblePages(currentPage, totalPages, maxVisible);
  const canGoNext =
    totalPages === undefined ? Boolean(hasNext) : currentPage < totalPages - 1;

  return (
    <nav
      aria-label="페이지 이동"
      className={cn("flex items-center gap-2.5", className)}
    >
      <button
        type="button"
        aria-label="이전 페이지"
        className={cn(itemClassName, "disabled:opacity-35")}
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeftIcon size={18} />
      </button>
      <div className="flex items-center gap-1">
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              aria-label={`${page + 1} 페이지`}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                itemClassName,
                isCurrent && "border-primary-bg-light text-primary-text"
              )}
              disabled={isCurrent}
              onClick={() => onPageChange(page)}
            >
              {page + 1}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="다음 페이지"
        className={cn(itemClassName, "disabled:opacity-35")}
        disabled={!canGoNext}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRightIcon size={18} />
      </button>
    </nav>
  );
};
