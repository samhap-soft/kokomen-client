import { getRankList } from "@/domains/members/api";
import { memberKeys } from "@/utils/querykeys";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { JSX } from "react";
import { captureButtonEvent } from "@/utils/analytics";
import Link from "next/link";

// 스켈레톤 UI 컴포넌트
const RankCardSkeleton = (): JSX.Element => {
  return (
    <div className="bg-bg-elevated rounded-3xl border border-border shadow-2xl overflow-hidden mt-5">
      <h3 className="text-lg font-bold text-gray-900 p-4">현재 랭크</h3>
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 w-full animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-300" />
            <div>
              <div className="h-5 bg-gray-300 rounded w-24 mb-1" />
            </div>
          </div>
          <div className="text-right">
            <div className="h-6 bg-gray-300 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function RankCard(): JSX.Element {
  const { data, isLoading } = useQuery({
    queryKey: memberKeys.rank(),
    queryFn: () => getRankList()
  });

  // 로딩 중일 때 스켈레톤 UI 렌더링
  if (isLoading) {
    return <RankCardSkeleton />;
  }

  return (
    <div className="bg-bg-elevated rounded-3xl border border-border shadow-2xl overflow-hidden mt-5 ">
      <h3 className="text-lg font-bold text-gray-900 p-4">현재 랭크</h3>
      {data?.map((rank, index) => (
        <Link
          key={rank.id}
          href={`/members/${rank.id}`}
          className="flex items-center justify-between p-4 w-full border-none shadow-none"
          type="button"
          role="button"
          aria-label={`rank-card-${rank.id}-${rank.nickname}`}
          onClick={() => {
            captureButtonEvent({
              name: "MemberDashboard",
              properties: {
                rank: rank.id,
                nickname: rank.nickname
              }
            });
          }}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-primary text-white font-bold text-lg flex-shrink-0">
              {index + 1}
            </div>
            <p className="font-semibold text-lg text-gray-900 truncate min-w-0 flex-1 text-left">
              {rank.nickname ?? "탈퇴한 사용자"}
            </p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {rank.score} <span className="text-sm text-gray-500">점</span>
          </p>
        </Link>
      ))}
    </div>
  );
}
