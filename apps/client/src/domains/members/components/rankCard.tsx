import { JSX } from "react";
import { captureButtonEvent } from "@/utils/analytics";
import Link from "next/link";
import { CamelCasedProperties, Rank } from "@kokomen/types";
import { textButtonVariants } from "@kokomen/ui";

export const RANK_CARD_SIZE: number = 3;

export default function RankCard({
  rankList
}: {
  rankList: CamelCasedProperties<Rank>[];
}): JSX.Element | null {
  if (!rankList.length) return null;

  return (
    <div className="flex flex-col justify-center gap-4 rounded-[20px] border border-border bg-bg-elevated px-6 py-[30px]">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-text-primary">
          랭킹 TOP{RANK_CARD_SIZE}
        </h3>
        <Link
          href="/rank"
          className={textButtonVariants({ variant: "primary" })}
        >
          전체 보기
        </Link>
      </div>
      <ol className="flex flex-col gap-2">
        {rankList.slice(0, RANK_CARD_SIZE).map((rank, index) => (
          <li key={rank.id}>
            <Link
              href={`/members/${rank.id}`}
              className="flex items-center gap-1.5 rounded-md text-text-primary transition-opacity hover:opacity-80"
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
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                  index === 0 ? "bg-primary-bg" : "bg-gray-3"
                }`}
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-base font-medium">
                {rank.nickname ?? "탈퇴한 사용자"}
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {rank.score.toLocaleString()}점
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
