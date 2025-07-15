import {
  AlertCircle,
  Award,
  CheckCircle,
  Crown,
  Medal,
  Star,
  Trophy,
} from "lucide-react";
import React from "react";

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

const getScoreColor = (rank: string): string => {
  switch (rank.toUpperCase()) {
    case "A":
      return "text-success";
    case "B":
      return "text-primary";
    case "C":
      return "text-warning";
    case "D":
    case "F":
      return "text-error";
    default:
      return "text-text-description";
  }
};

const getScoreIcon = (rank: string): React.ReactNode => {
  switch (rank.toUpperCase()) {
    case "A":
      return <Award className="w-5 h-5" />;
    case "B":
      return <Star className="w-5 h-5" />;
    case "C":
      return <CheckCircle className="w-5 h-5" />;
    case "D":
    case "F":
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <Star className="w-5 h-5" />;
  }
};

const getScoreLabel = (rank: string): string => {
  switch (rank.toUpperCase()) {
    case "A":
      return "우수";
    case "B":
      return "양호";
    case "C":
      return "보통";
    case "D":
      return "미흡";
    case "F":
      return "불량";
    default:
      return rank;
  }
};

export {
  getRankDisplay,
  getPercentileDisplay,
  getScoreColor,
  getScoreIcon,
  getScoreLabel,
};
