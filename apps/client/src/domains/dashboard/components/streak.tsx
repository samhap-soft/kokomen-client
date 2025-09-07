import { useQuery } from "@tanstack/react-query";
import { meKeys } from "@kokomen/utils";
import { getStreak } from "@/domains/dashboard/api";
import { useState } from "react";
import { StreakCalendar } from "@kokomen/ui/domains";
import { Skeleton } from "@kokomen/ui";

export default function Streak() {
  const startDate = new Date(new Date().setDate(new Date().getDate() - 365))
    .toISOString()
    .split("T")[0];
  const endDate = new Date().toISOString().split("T")[0];
  const [streakDate] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: startDate,
    endDate: endDate
  });
  const {
    data: streakData,
    isLoading,
    isError
  } = useQuery({
    queryKey: [meKeys.streak()],
    queryFn: () => getStreak(streakDate.startDate, streakDate.endDate),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1
  });
  if (isLoading) return <Skeleton className="w-full h-44" />;
  if (isError || !streakData) return null;

  return (
    <div className="rounded-2xl shadow-sm border border-border-secondary p-6 mb-6 bg-bg-elevated">
      <h3 className="text-lg font-bold mb-4">스트릭</h3>
      <div className="mx-auto">
        <StreakCalendar
          className="mx-auto"
          streak={streakData}
          startDate={streakDate.startDate}
          endDate={streakDate.endDate}
        />
      </div>
    </div>
  );
}
