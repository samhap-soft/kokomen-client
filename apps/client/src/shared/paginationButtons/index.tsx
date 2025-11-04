import { Button } from "@kokomen/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/router";
import { useScreenSize } from "@/hooks/useScreenSize";
import { getVisiblePageNumbers } from "@/utils/pagination";
import { JSX } from "react";
import { CamelCasedProperties, Paginated } from "@kokomen/types";

export default function PaginationButtons({
  totalPages,
  currentPage,
  basePath,
  options
}: CamelCasedProperties<Omit<Paginated<any>, "data">> & {
  basePath: string;
  options: Record<string, string>;
}): JSX.Element {
  const router = useRouter();
  const { isMobile } = useScreenSize();
  const maxVisibleButtons = isMobile ? 3 : 5;
  const visiblePageNumbers = getVisiblePageNumbers(
    currentPage,
    totalPages,
    maxVisibleButtons
  );
  const optionsString = Object.entries(options)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return (
    <div className="flex justify-center gap-2">
      <Button
        type="button"
        role="button"
        name="prev page"
        aria-label="prev page"
        onClick={() => {
          router.push(
            `/${basePath}?page=${currentPage === 0 ? 0 : currentPage - 1}`
          );
        }}
        disabled={currentPage === 0}
      >
        <ChevronLeft />
      </Button>

      {visiblePageNumbers.map((pageNumber) => (
        <Button
          key={pageNumber}
          type="button"
          role="button"
          name={`${pageNumber + 1} page`}
          aria-label="page"
          variant={currentPage === pageNumber ? "primary" : "glass"}
          className={`${currentPage === pageNumber && "disabled:opacity-100 disabled:bg-primary-bg-hover disabled:text-primary"}`}
          onClick={() => {
            router.push(
              `/${basePath}?page=${pageNumber}${optionsString ? `&${optionsString}` : ""}`
            );
          }}
          disabled={currentPage === pageNumber}
        >
          {pageNumber + 1}
        </Button>
      ))}

      <Button
        type="button"
        role="button"
        name="next page"
        aria-label="next page"
        disabled={currentPage === totalPages - 1}
        onClick={() => {
          router.push(
            `/${basePath}?page=${currentPage + 1}${optionsString ? `&${optionsString}` : ""}`
          );
        }}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
