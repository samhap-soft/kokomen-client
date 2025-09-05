import { Streak } from "@kokomen/types";
import { cn } from "../../../utils";
import { JSX, useState } from "react";

interface StreakCalendarProps {
  streak: Streak;
  className?: string;
  startDate?: string;
  endDate?: string;
}

export default function StreakCalendar({
  streak,
  className,
  startDate,
  endDate
}: StreakCalendarProps): JSX.Element {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
    formattedDate: string;
    x: number;
    y: number;
  } | null>(null);
  const today = new Date();
  const cellSize = 11;
  const cellGap = 4;

  // 기본값 설정: startDate가 없으면 2025-08-01, endDate가 없으면 오늘
  const calendarStartDate = startDate
    ? new Date(startDate)
    : new Date("2025-08-01");
  const calendarEndDate = endDate ? new Date(endDate) : today;

  const streakMap = new Map(
    streak.daily_counts.map((item) => [item.date, item.count])
  );

  const getIntensity = (count: number): string => {
    const maxPerDay = streak.daily_counts.reduce(
      (max, item) => Math.max(max, item.count),
      4
    );
    const ratio = count / maxPerDay;
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";
    if (ratio < 0.2) return "bg-primary/10";
    if (ratio < 0.4) return "bg-primary/30";
    if (ratio < 0.6) return "bg-primary/50";
    if (ratio < 0.8) return "bg-primary/70";
    return "bg-primary/90";
  };

  const generateCalendarData = (): (null | {
    date: string;
    count: number;
    dayOfWeek: number;
    formattedDate: string;
  })[][] => {
    const weeks = [];

    // 시작 날짜를 주의 시작(일요일)으로 조정
    const adjustedStartDate = new Date(calendarStartDate);
    const startDayOfWeek = adjustedStartDate.getDay();
    adjustedStartDate.setDate(adjustedStartDate.getDate() - startDayOfWeek);

    // 끝 날짜를 주의 끝(토요일)으로 조정
    const adjustedEndDate = new Date(calendarEndDate);
    const endDayOfWeek = adjustedEndDate.getDay();
    if (endDayOfWeek !== 6) {
      adjustedEndDate.setDate(adjustedEndDate.getDate() + (6 - endDayOfWeek));
    }

    // 전체 기간 계산
    const totalDays =
      Math.floor(
        (adjustedEndDate.getTime() - adjustedStartDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;
    const totalWeeks = Math.ceil(totalDays / 7);

    for (let week = 0; week < totalWeeks; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(adjustedStartDate);
        currentDate.setDate(adjustedStartDate.getDate() + week * 7 + day);

        if (
          currentDate >= calendarStartDate &&
          currentDate <= calendarEndDate
        ) {
          const dateStr = currentDate.toISOString().split("T")[0];
          const count = streakMap.get(dateStr) || 0;
          days.push({
            date: dateStr,
            count,
            dayOfWeek: currentDate.getDay(),
            formattedDate: currentDate.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })
          });
        } else {
          days.push(null);
        }
      }
      weeks.push(days);
    }
    return weeks;
  };

  const calendarData = generateCalendarData();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  const getMonthLabels = (): { month: string; weekIndex: number }[] => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    calendarData.forEach((week, weekIndex) => {
      const firstValidDay = week.find((day) => day !== null);
      if (firstValidDay) {
        const date = new Date(firstValidDay.date);
        const currentMonth = date.getMonth();
        if (currentMonth !== lastMonth) {
          labels.push({
            month: months[currentMonth],
            weekIndex
          });
          lastMonth = currentMonth;
        }
      }
      if (weekIndex === calendarData.length - 1) {
        for (let i = week.length - 1; i >= 0; i--) {
          const day = week[i];
          if (day) {
            const date = new Date(day.date);
            const currentMonth = date.getMonth();
            if (currentMonth !== lastMonth) {
              labels.push({ month: months[currentMonth], weekIndex });
              lastMonth = currentMonth;
            }
            break;
          }
        }
      }
    });

    return labels;
  };

  const monthLabels = getMonthLabels();

  return (
    <div className={cn("relative p-4", className)}>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex gap-1">
            <div>
              <div className="flex mb-1 relative" style={{ height: "16px" }}>
                {monthLabels.map((label, index) => (
                  <div
                    key={index}
                    className="text-xs text-text-secondary"
                    style={{
                      position: "absolute",
                      marginLeft: `${label.weekIndex * (cellSize + cellGap)}px`
                    }}
                  >
                    {label.month}
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                {calendarData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <div key={dayIndex} className="relative">
                        {day ? (
                          <div
                            className={cn(
                              "rounded-sm transition-all duration-200 hover:ring-2 hover:ring-primary hover:ring-offset-1 cursor-pointer",
                              getIntensity(day.count)
                            )}
                            style={{
                              width: `${cellSize}px`,
                              height: `${cellSize}px`
                            }}
                            onMouseEnter={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              setHoveredDay({
                                date: day.date,
                                count: day.count,
                                formattedDate: day.formattedDate,
                                x: rect.left + rect.width / 2,
                                y: rect.top
                              });
                            }}
                            onMouseLeave={() => setHoveredDay(null)}
                          />
                        ) : (
                          <div
                            style={{
                              width: `${cellSize}px`,
                              height: `${cellSize}px`
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row  items-end justify-end gap-4 mt-4 pt-4 border-t border-border-secondary w-full">
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-secondary">적음</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn("rounded-sm", getIntensity(level))}
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-text-secondary">많음</span>
            </div>

            <div className="text-xs text-text-tertiary">
              {calendarStartDate.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}{" "}
              ~{" "}
              {calendarEndDate.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </div>
          </div>
        </div>
      </div>

      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y}px`,
            transform: "translate(-50%, -100%) translateY(-8px)"
          }}
        >
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            <div className="font-medium">{hoveredDay.formattedDate}</div>
            <div>
              {hoveredDay.count > 0
                ? `인터뷰 ${hoveredDay.count}개 완료`
                : "활동 없음"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
