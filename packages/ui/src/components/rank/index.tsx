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
    color = "text-gold-6";
    bgColor = "bg-gold-1";
  } else if (rank <= 3) {
    icon = Medal;
    color = "text-gold-6";
    bgColor = "bg-gold-1";
  } else if (rank <= 10) {
    icon = Award;
    color = "text-blue-6";
    bgColor = "bg-blue-1";
  } else {
    icon = Trophy;
    color = "text-text-tertiary";
    bgColor = "bg-magenta-1";
  }
  const Icon = icon;
  return (
    <span
      className={`${color} ${bgColor} inline-flex items-center rounded px-2 py-1`}
    >
      <Icon className="w-5 h-5 mr-1" />
      {rank}
    </span>
  );
};

export const Percentile: React.FC<{ percentile: number }> = ({
  percentile
}) => {
  let color: string, bgColor: string;
  if (percentile >= 90) {
    color = "text-volcano-7";
    bgColor = "bg-volcano-1";
  } else if (percentile >= 70) {
    color = "text-volcano-6";
    bgColor = "bg-volcano-1";
  } else if (percentile >= 60) {
    color = "text-volcano-5";
    bgColor = "bg-volcano-1";
  } else if (percentile >= 50) {
    color = "text-volcano-4";
    bgColor = "bg-volcano-1";
  } else if (percentile >= 40) {
    color = "text-green-7";
    bgColor = "bg-green-1";
  } else if (percentile >= 30) {
    color = "text-green-6";
    bgColor = "bg-green-1";
  } else if (percentile >= 20) {
    color = "text-green-4";
    bgColor = "bg-green-1";
  } else if (percentile >= 10) {
    color = "text-primary";
    bgColor = "bg-primary-1";
  } else {
    color = "text-gold-5";
    bgColor = "bg-gold-1";
  }
  return (
    <span
      className={`${color} ${bgColor} inline-flex items-center rounded px-2 py-1`}
    >
      {percentile}%
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
