import { JSX } from "react";
import { IBadgeProps } from "@kokomen/ui";
import {
  getScoreColor,
  getScoreIcon,
  getScoreLabel
} from "@/utils/rankDisplay";

// 면접 결과에서 "보완이 필요한" 것으로 보는 등급.
const WEAK_RANKS: readonly string[] = ["C", "D", "F"];

const RANK_ORDER: readonly string[] = ["A", "B", "C", "D", "F"];

/** Figma Score 인스턴스처럼 "B등급 (양호)" 형태로 아이콘과 함께 보여준다. */
export function RankLabel({ rank }: { rank: string }): JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-base ${getScoreColor(rank)}`}
    >
      {getScoreIcon(rank)}
      {rank}등급 ({getScoreLabel(rank)})
    </span>
  );
}

export const getRankBadgeType = (rank: string): IBadgeProps["type"] => {
  switch (rank.toUpperCase()) {
    case "A":
      return "success";
    case "B":
      return "brand";
    case "C":
      return "warning";
    case "D":
    case "F":
      return "error";
    default:
      return "neutral";
  }
};

// AI 피드백 상단 뱃지 문구. 피드백 본문 요약 필드가 없어 등급으로 정한다.
export const getRankBadgeLabel = (rank: string): string => {
  switch (rank.toUpperCase()) {
    case "A":
      return "핵심을 잘 짚었어요";
    case "B":
      return "개념 이해는 좋아요";
    case "C":
      return "조금 더 보완해 봐요";
    case "D":
      return "핵심을 다시 정리해 봐요";
    case "F":
      return "기초부터 다시 짚어봐요";
    default:
      return `${rank}등급`;
  }
};

export const isWeakRank = (rank: string): boolean =>
  WEAK_RANKS.includes(rank.toUpperCase());

// 등급이 낮을수록 큰 값. 순서에 없는 등급은 가장 뒤로 보낸다.
export const getRankWeight = (rank: string): number => {
  const index = RANK_ORDER.indexOf(rank.toUpperCase());
  return index === -1 ? -1 : index;
};
