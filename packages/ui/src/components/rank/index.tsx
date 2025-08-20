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
    color = "text-yellow-8";
    bgColor = "bg-yellow-2";
  } else if (rank === 2) {
    icon = Medal;
    color = "text-gray-600";
    bgColor = "bg-gray-200";
  } else if (rank === 3) {
    icon = Medal;
    color = "text-orange-7";
    bgColor = "bg-orange-2";
  } else if (rank <= 10) {
    icon = Award;
    color = "text-blue-7";
    bgColor = "bg-blue-2";
  } else {
    icon = Trophy;
    color = "text-purple-7";
    bgColor = "bg-purple-2";
  }
  const Icon = icon;
  return (
    <span
      className={`${color} ${bgColor} inline-flex items-center rounded-xl px-4 py-2 font-bold`}
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
  if (percentile >= 90) {
    color = "text-red-7";
    bgColor = "bg-red-2";
  } else if (percentile >= 70) {
    color = "text-volcano-7";
    bgColor = "bg-volcano-2";
  } else if (percentile >= 50) {
    color = "text-orange-7";
    bgColor = "bg-orange-2";
  } else if (percentile >= 30) {
    color = "text-yellow-7";
    bgColor = "bg-yellow-2";
  } else if (percentile >= 20) {
    color = "text-lime-7";
    bgColor = "bg-lime-2";
  } else if (percentile >= 10) {
    color = "text-green-7";
    bgColor = "bg-green-2";
  } else if (percentile >= 5) {
    color = "text-cyan-7";
    bgColor = "bg-cyan-2";
  } else if (percentile >= 1) {
    color = "text-blue-7";
    bgColor = "bg-blue-2";
  } else {
    color = "text-purple-7";
    bgColor = "bg-purple-2";
  }
  return (
    <span
      className={`${color} ${bgColor} inline-flex items-center rounded-xl px-4 py-2 font-bold `}
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
      color = "text-text-description";
      label = rank;
      icon = <Star className="w-5 h-5 mr-1" />;
  }
  return (
    <span className={`${color} inline-flex items-center rounded px-2 py-1`}>
      {icon}
      {label}
    </span>
  );
};
