import { getInterviewHistory } from "@/domains/dashboard/api";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { interviewHistoryKeys } from "@/utils/querykeys";
import { Select } from "@kokomen/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  NotebookPen,
  TrendingUp,
  Trophy
} from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

export default function InterviewHistory() {
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [range, setRange] = useState<"IN_PROGRESS" | "FINISHED" | "ALL">("ALL");
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: interviewHistoryKeys.infinite([sort, range]),
    queryFn: ({ pageParam = 0 }) =>
      getInterviewHistory({
        page: pageParam,
        size: 10,
        sort: sort,
        range: range
      }),
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지가 10개 미만이면 더 이상 페이지가 없음
      if (lastPage.length < 10) {
        return undefined;
      }
      // 다음 페이지 번호 반환 (0부터 시작)
      return allPages.length;
    },
    initialPageParam: 0
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useIntersectionObserver(loadMoreRef, handleIntersection);

  // 모든 페이지의 데이터를 평탄화
  const allInterviews = data?.pages.flat() || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "FINISHED") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          완료
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        진행중
      </span>
    );
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">면접 기록</h1>
        <p className="text-gray-600">나의 면접 히스토리를 확인해보세요</p>
      </div>
      <div className="flex gap-2 mb-4">
        <Select
          className="md:w-44 w-32"
          placeholder="면접 상태"
          value={range}
          options={[
            { value: "ALL", label: "전체" },
            { value: "FINISHED", label: "완료" },
            { value: "IN_PROGRESS", label: "진행중" }
          ]}
          onChange={(value) => {
            setRange(value as "IN_PROGRESS" | "FINISHED" | "ALL");
          }}
        />
        <Select
          className="md:w-44 w-32"
          placeholder="날짜 정렬"
          value={sort}
          options={[
            { value: "desc", label: "최신순", disabled: false },
            { value: "asc", label: "오래된순", disabled: false }
          ]}
          onChange={(value) => setSort(value as "desc" | "asc")}
        />
      </div>
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <p className="text-red-600">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      )}

      {!isLoading && allInterviews.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            아직 면접 기록이 없습니다
          </h3>
          <p className="text-gray-600 mb-6">첫 번째 면접을 시작해보세요!</p>
          <Link
            href="/interviews"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            면접 시작하기
          </Link>
        </div>
      )}

      {allInterviews.length > 0 && (
        <div className="space-y-4">
          {allInterviews.map((interview) => (
            <div
              key={interview.interview_id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between md:flex-row md:w-auto w-full flex-col gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {interview.interview_category}
                    </h3>
                    {getStatusBadge(interview.interview_state)}
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {interview.root_question}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(interview.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {interview.cur_answer_count}/
                      {interview.max_question_count}문제
                    </div>
                    {interview.interview_state === "FINISHED" && (
                      <div
                        className={`flex items-center gap-1 ${
                          interview.score > 0
                            ? "text-green-6"
                            : "text-volcano-6"
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        {interview.score}점
                      </div>
                    )}
                    {interview.interview_state === "FINISHED" && (
                      <>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {interview.interview_view_count}
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            interview.interview_already_liked
                              ? "text-volcano-6"
                              : "text-gray-400"
                          }`}
                        >
                          <Heart className="w-4 h-4" />
                          {interview.interview_like_count}
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            interview.submitted_answer_memo_count > 0
                              ? "text-gold-6"
                              : "text-gray-400"
                          }`}
                        >
                          <NotebookPen className="w-4 h-4" />
                          {interview.submitted_answer_memo_count}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="md:ml-4 md:w-auto w-full flex flex-col gap-2">
                  <Link
                    href={
                      interview.interview_state === "FINISHED"
                        ? `/interviews/${interview.interview_id}/result`
                        : `/interviews/${interview.interview_id}`
                    }
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors md:w-auto w-full justify-center"
                  >
                    {interview.interview_state === "FINISHED"
                      ? "보고서 보기"
                      : "이어하기"}
                  </Link>
                  {interview.interview_state === "FINISHED" && (
                    <Link
                      href={`/members/interviews/${interview.interview_id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-text-light-solid bg-gradient-primary hover:bg-blue-100 transition-colors md:w-auto w-full justify-center"
                    >
                      공개된 결과 보기
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 무한스크롤 트리거 */}
      <div ref={loadMoreRef} className="py-8">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
        {!hasNextPage && allInterviews.length > 0 && (
          <div className="text-center text-gray-500 text-sm">
            모든 면접 기록을 불러왔습니다
          </div>
        )}
      </div>
    </div>
  );
}
