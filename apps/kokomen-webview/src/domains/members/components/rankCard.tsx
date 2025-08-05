import { useSuspenseQuery } from "@tanstack/react-query";
import { memberKeys } from "@kokomen/utils/general/querykeys";
import { Button } from "@kokomen/ui";
import { JSX } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { getRankList } from "@/domains/members/api";

// 스켈레톤 UI 컴포넌트
export const RankCardSkeleton = (): JSX.Element => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-5">
      <h3 className="text-base font-semibold text-gray-800 p-4 border-b border-gray-100 flex gap-2 ">
        <Crown className="text-purple-4" />
        <span>현재 면접 등수</span>
      </h3>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 w-full animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded w-20 mb-1" />
          </div>
          <div className="h-5 bg-gray-200 rounded w-12" />
        </div>
      ))}
    </div>
  );
};

export function RankCard(): JSX.Element {
  const { data } = useSuspenseQuery({
    queryKey: memberKeys.rank(),
    queryFn: () => getRankList()
  });
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-5">
      <h3 className="text-base font-semibold text-gray-800 p-4 border-b border-gray-100 flex gap-2 ">
        <Crown className="text-purple-4" />
        <span>현재 면접 등수</span>
      </h3>
      {data?.map((rank, index) => (
        <Button
          key={rank.id}
          variant="glass"
          className="flex items-center justify-between p-4 w-full border-none shadow-none hover:bg-gray-50 transition"
          type="button"
          role="button"
          name={`rank-card-${rank.id}-${rank.nickname}`}
          aria-label={`rank-card-${rank.id}-${rank.nickname}`}
          onClick={() => {
            navigate({
              to: `/members/${rank.id}`,
              viewTransition: true
            });
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-text-light-solid font-medium text-base">
              {index + 1}
            </div>
            <span className="text-lg font-medium text-gray-800">
              {rank.nickname}
            </span>
          </div>
          <span className="text-base font-semibold text-gray-700">
            {rank.score} <span className="text-xs text-gray-400">점</span>
          </span>
        </Button>
      ))}
    </div>
  );
}
