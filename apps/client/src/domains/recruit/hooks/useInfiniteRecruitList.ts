import { getPaginatedRecruitList } from "@/domains/recruit/api";
import { useRecruitFilter } from "@/domains/recruit/components/recruitFilterContext";
import { recruitKeys } from "@/utils/querykeys";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { useInfiniteObserver } from "@kokomen/utils";

export function useInfiniteRecruitList() {
  const { filters } = useRecruitFilter();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteQuery({
    queryKey: recruitKeys.list(filters),
    queryFn: ({ pageParam = 0 }) =>
      getPaginatedRecruitList({ page: pageParam, size: 20, ...filters }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNext ? allPages.length : undefined;
    },
    initialPageParam: 0,
    select: (data) => data.pages.map((page) => page.data).flat()
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);
  useInfiniteObserver(loadMoreRef, () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    loadMoreRef,
    isFetching: isFetchingNextPage || isLoading,
    refetch
  };
}
