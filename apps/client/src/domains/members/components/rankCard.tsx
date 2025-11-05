import { JSX } from "react";
import { captureButtonEvent } from "@/utils/analytics";
import Link from "next/link";
import { CamelCasedProperties, Rank } from "@kokomen/types";

export default function RankCard({
  rankList
}: {
  rankList: CamelCasedProperties<Rank>[];
}): JSX.Element | null {
  if (!rankList.length) return null;

  return (
    <div className="bg-bg-elevated rounded-3xl border border-border shadow-2xl overflow-hidden mt-5 ">
      <h3 className="text-lg font-bold text-gray-900 p-4">현재 랭크</h3>
      {rankList.map((rank, index) => (
        <Link
          key={rank.id}
          href={`/members/${rank.id}`}
          className="flex items-center justify-between p-4 w-full border-none shadow-none"
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
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-bg-light text-primary font-bold text-lg flex-shrink-0">
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
