import { createFileRoute } from "@tanstack/react-router";
import { memberKeys, useInfiniteObserver } from "@kokomen/utils";
import { getMemberInterviews } from "@/domains/members/api";
import { LoadingFullScreen, RoundSpinner } from "@kokomen/ui";
import { useState, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Rank, Percentile } from "@kokomen/ui";
import { useParams } from "@tanstack/react-router";
import MemberInterviewHistory from "@/domains/members/components/memberInterviewHistory";
import ErrorComponent from "@/common/components/ErrorComponent";

export const Route = createFileRoute("/members/$memberId")({
  component: RouteComponent,
  loader: ({ params: { memberId }, context: { queryClient } }) => {
    const MemberQueryOptions = {
      queryKey: memberKeys.interviewsByIdAndPage(Number(memberId), "desc", 0),
      queryFn: () => getMemberInterviews(Number(memberId)),
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1
    };
    return queryClient.ensureQueryData(MemberQueryOptions);
  },
  errorComponent: () => (
    <ErrorComponent
      cause="존재하지 않는 유저예요"
      subText="다른 유저를 검색해보세요."
    />
  ),
  pendingComponent: LoadingFullScreen
});

function RouteComponent() {
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const { memberId } = useParams({ from: "/members/$memberId" });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: memberKeys.infiniteInterviewHistory([sort, Number(memberId)]),
    queryFn: ({ pageParam = 0 }) =>
      getMemberInterviews(Number(memberId), pageParam, sort, 10),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.interviewSummaries.length < 10) return undefined;
      return allPages.length;
    },
    initialPageParam: 0
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useInfiniteObserver(loadMoreRef, () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  if (isLoading) return <LoadingFullScreen />;
  if (isError || !data)
    return (
      <ErrorComponent
        cause="존재하지 않는 유저예요"
        subText="다른 유저를 검색해보세요."
      />
    );

  // 선언적으로 모든 페이지의 데이터를 평탄화
  const allInterviews = data?.pages.flatMap((page) => page.interviewSummaries);
  const memberInfo = data.pages[0];
  const percentile =
    memberInfo && memberInfo.totalMemberCount
      ? Math.round(
          (memberInfo.intervieweeRank / memberInfo.totalMemberCount) * 100
        )
      : 0;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 멤버 정보 카드 */}
      <div className="bg-bg-elevated rounded-lg border border-border-secondary shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 flex-col md:flex-row">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-heading">
                {memberInfo?.intervieweeNickname ?? "탈퇴한 사용자"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>{memberInfo?.intervieweeNickname}님은</span>
            <span>{memberInfo?.totalMemberCount}명 중</span>
            <Rank rank={memberInfo?.intervieweeRank} />
          </div>
        </div>
        {/* 진행 바로 상위 퍼센트 시각화 */}
        <div className="mt-4 pt-4 border-t border-border-secondary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-label">전체 멤버 중 위치</span>
            <Percentile
              rank={memberInfo.intervieweeRank}
              totalMemberCount={memberInfo.totalMemberCount}
            />
          </div>
          <div className="w-full bg-fill-tertiary rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-6 to-blue-6 h-2 rounded-full transition-all duration-300"
              style={{ width: `${100 - percentile}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-text-tertiary">
            <span>{memberInfo?.totalMemberCount}위</span>
            <span>1위</span>
          </div>
        </div>
      </div>
      {/* 면접 기록 섹션 */}
      <div className="bg-bg-base rounded-lg border border-border-secondary shadow-sm p-6">
        <h2 className="text-xl font-bold text-text-heading mb-4">면접 기록</h2>
        <MemberInterviewHistory
          memberId={Number(memberId)}
          interviewSummaries={allInterviews}
          sort={sort}
          setSort={setSort}
        />
        <div ref={loadMoreRef} className="py-8">
          {isFetchingNextPage && (
            <div className="flex justify-center">
              <RoundSpinner />
            </div>
          )}
          {!hasNextPage && allInterviews.length > 0 && (
            <div className="text-center text-gray-500 text-sm">
              모든 면접 기록을 불러왔습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
