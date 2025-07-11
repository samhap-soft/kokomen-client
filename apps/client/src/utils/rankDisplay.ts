import { Award, Crown, Medal, Trophy } from "lucide-react";

// 랭킹에 따른 아이콘과 색상 결정하는 함수
const getRankDisplay = (rank: number) => {
  if (rank === 1) {
    return { icon: Crown, color: "text-gold-6", bgColor: "bg-gold-1" };
  } else if (rank <= 3) {
    return { icon: Medal, color: "text-gold-6", bgColor: "bg-gold-1" };
  } else if (rank <= 10) {
    return { icon: Award, color: "text-blue-6", bgColor: "bg-blue-1" };
  } else {
    return {
      icon: Trophy,
      color: "text-text-tertiary",
      bgColor: "bg-magenta-1",
    };
  }
};

const getPercentileDisplay = (percentile: number) => {
  if (percentile >= 90) {
    return { color: "text-volcano-7", bgColor: "bg-volcano-1" };
  } else if (percentile >= 70) {
    return { color: "text-volcano-6", bgColor: "bg-volcano-1" };
  } else if (percentile >= 60) {
    return { color: "text-volcano-5", bgColor: "bg-volcano-1" };
  } else if (percentile >= 50) {
    return { color: "text-volcano-4", bgColor: "bg-volcano-1" };
  } else if (percentile >= 40) {
    return { color: "text-green-7", bgColor: "bg-green-1" };
  } else if (percentile >= 30) {
    return { color: "text-green-6", bgColor: "bg-green-1" };
  } else if (percentile >= 20) {
    return { color: "text-green-4", bgColor: "bg-green-1" };
  } else if (percentile >= 10) {
    return { color: "text-primary", bgColor: "bg-primary-1" };
  } else {
    return { color: "text-gold-5", bgColor: "bg-gold-1" };
  }
};

export { getRankDisplay, getPercentileDisplay };
