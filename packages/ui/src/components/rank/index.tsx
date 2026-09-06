import {
  AlertCircle,
  Award,
  CheckCircle,
  Crown,
  Medal,
  Star,
  Trophy
} from "lucide-react";
import React from "react";

// 랭킹에 따른 아이콘과 색상 컴포넌트
export const Rank: React.FC<{ rank: number }> = ({ rank }) => {
  let icon: React.ElementType, color: string, bgColor: string;
  if (rank === 1) {
    icon = Crown;
    color = "text-yellow-10";
    bgColor =
      "bg-[linear-gradient(117.74deg,var(--color-yellow-4)_14.57%,var(--color-yellow-1)_49.38%,var(--color-yellow-4)_84.18%)]";
  } else if (rank === 2) {
    icon = Medal;
    color = "text-gray-800";
    bgColor =
      "bg-[linear-gradient(119.05deg,var(--color-gray-300)_13.13%,var(--color-base-white)_50%,var(--color-gray-300)_86.87%)]";
  } else if (rank === 3) {
    icon = Medal;
    color = "text-orange-10";
    bgColor =
      "bg-[linear-gradient(116.28deg,var(--color-yellow-7)_10%,var(--color-orange-3)_50%,var(--color-yellow-7)_90%)]";
  } else if (rank <= 10) {
    icon = Award;
    color = "text-primary-10";
    bgColor = "bg-primary-4";
  } else {
    icon = Trophy;
    color = "text-purple-7";
    bgColor = "bg-purple-2";
  }
  const Icon = icon;
  return (
    <span
      className={`${color} ${bgColor} inline-flex items-center rounded-xl px-4 py-2 text-base font-bold`}
    >
      <Icon className="w-5 h-5 mr-1" />
      {rank}위
    </span>
  );
};

export const Percentile: React.FC<{
  rank: number;
  totalMemberCount: number;
}> = ({ rank, totalMemberCount }) => {
  const percentile = Math.round((rank / totalMemberCount) * 100);
  let color: string, bgColor: string;
  // 백분위가 낮을수록(상위권일수록) 희소한 색을 씁니다
  if (percentile <= 1) {
    color = "text-purple-8";
    bgColor = "bg-purple-2";
  } else if (percentile <= 10) {
    color = "text-blue-9";
    bgColor = "bg-blue-2";
  } else if (percentile <= 30) {
    color = "text-green-9";
    bgColor = "bg-green-2";
  } else if (percentile <= 50) {
    color = "text-yellow-10";
    bgColor = "bg-yellow-2";
  } else {
    color = "text-volcano-10";
    bgColor = "bg-volcano-1";
  }
  return (
    <span
      className={`${color} ${bgColor} inline-flex items-center rounded-xl px-4 py-2 text-base font-bold`}
    >
      상위 {percentile}%
    </span>
  );
};

export const Score: React.FC<{ rank: string }> = ({ rank }) => {
  let color: string, label: string, icon: React.ReactNode;
  switch (rank.toUpperCase()) {
    case "A":
      color = "text-success";
      label = "우수";
      icon = <Award className="w-5 h-5 mr-1" />;
      break;
    case "B":
      color = "text-primary";
      label = "양호";
      icon = <Star className="w-5 h-5 mr-1" />;
      break;
    case "C":
      color = "text-warning";
      label = "보통";
      icon = <CheckCircle className="w-5 h-5 mr-1" />;
      break;
    case "D":
      color = "text-error";
      label = "미흡";
      icon = <AlertCircle className="w-5 h-5 mr-1" />;
      break;
    case "F":
      color = "text-error";
      label = "불량";
      icon = <AlertCircle className="w-5 h-5 mr-1" />;
      break;
    default:
      color = "text-text-primary";
      label = rank;
      icon = <Star className="w-5 h-5 mr-1" />;
  }
  return (
    <span
      className={`${color} inline-flex items-center rounded px-2 py-1 text-base`}
    >
      {icon}
      {label}
    </span>
  );
};
