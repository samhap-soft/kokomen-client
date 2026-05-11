import { JSX } from "react";
import { captureButtonEvent } from "@/utils/analytics";
import Link from "next/link";
import { CamelCasedProperties, Rank } from "@kokomen/types";
import { Crown } from "lucide-react";

const MEDAL_STYLES = [
  "bg-amber-100 text-amber-700 border-amber-300",
  "bg-gray-100 text-gray-500 border-gray-300",
  "bg-orange-100 text-orange-700 border-orange-300"
] as const;

export default function RankCard({
  rankList
}: {
  rankList: CamelCasedProperties<Rank>[];
}): JSX.Element | null {
  if (!rankList.length) return null;

  return (
    <div className="bg-bg-elevated rounded-3xl border border-border overflow-hidden mt-5">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Crown className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-bold text-text-primary">랭킹</h3>
      </div>
      <div className="divide-y divide-border">
        {rankList.map((rank, index) => (
          <Link
            key={rank.id}
            href={`/members/${rank.id}`}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-bg-base-hover transition-colors"
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
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 border ${
                index < 3
                  ? MEDAL_STYLES[index]
                  : "bg-bg-base text-text-tertiary border-border"
              }`}
            >
              {index + 1}
            </div>
            <p className="font-medium text-sm text-text-primary truncate min-w-0 flex-1">
              {rank.nickname ?? "탈퇴한 사용자"}
            </p>
            <p className="text-sm font-semibold text-text-secondary tabular-nums">
              {rank.score.toLocaleString()}
              <span className="text-text-tertiary font-normal ml-0.5">점</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
