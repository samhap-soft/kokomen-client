import { getRankList } from "@/domains/members/api";
import { memberKeys } from "@/utils/querykeys";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Button } from "@kokomen/ui/components/button";

export default function RankCard() {
  const { data } = useQuery({
    queryKey: memberKeys.rank(),
    queryFn: () => getRankList(),
  });
  const router = useRouter();

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
          onClick={() => router.push(`/members/${rank.id}`)}
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
