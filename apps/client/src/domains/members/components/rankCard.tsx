import { getRankList } from "@/domains/members/api";
import { memberKeys } from "@/utils/querykeys";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Button } from "@kokomen/ui/components/button";
import { JSX } from "react";
import { captureButtonEvent } from "@/utils/analytics";

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
    queryFn: () => getRankList(),
  });
  const router = useRouter();

  // 로딩 중일 때 스켈레톤 UI 렌더링
  if (isLoading) {
    return <RankCardSkeleton />;
  }

  return (
    <div className="bg-bg-elevated rounded-3xl border border-border shadow-2xl overflow-hidden mt-5 ">
      <h3 className="text-lg font-bold text-gray-900 p-4">현재 랭크</h3>
      {data?.map((rank, index) => (
        <Button
          key={rank.id}
          variant={"info"}
          className="flex items-center justify-between p-4 w-full border-none shadow-none"
          type="button"
          role="button"
          name={`rank-card-${rank.id}-${rank.nickname}`}
          aria-label={`rank-card-${rank.id}-${rank.nickname}`}
          onClick={() => {
            captureButtonEvent({
              name: "MemberDashboard",
              properties: {
                rank: rank.id,
                nickname: rank.nickname,
              },
            });
            router.push(`/members/${rank.id}`);
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-primary  text-white font-bold text-lg">
              {index + 1}
            </div>
            <div>
              <p className="font-semibold text-lg text-gray-900">
                {rank.nickname}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              {rank.score} <span className="text-sm text-gray-500">점</span>
            </p>
          </div>
        </Button>
      ))}
    </div>
  );
}
