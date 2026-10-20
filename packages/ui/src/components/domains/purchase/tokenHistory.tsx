import { CamelCasedProperties, PurchaseHistory } from "@kokomen/types";
import React, { JSX } from "react";
import { cn } from "../../../utils";

/**
 * Figma: Token History — 747:1749 (사용중 · 사용완료 · 미사용 3종)
 *
 * 열 폭은 Figma 표(1182px)를 그대로 따른다. 좁은 화면에서는 부모가
 * 가로 스크롤을 맡는다(`min-w-[1182px]` 래퍼).
 */
const COLUMNS = [
  { label: "구매일자", className: "w-[134px] items-start pl-5" },
  { label: "구매 상품", className: "w-[250px] items-start pl-5" },
  { label: "사용 상태", className: "w-[132px] items-center" },
  { label: "결제 수단", className: "w-[280px] items-center" },
  { label: "결제 금액", className: "w-[170px] items-center" },
  { label: "환불 상태", className: "w-[172px] items-center" }
] as const;

const cellClassName = "flex shrink-0 flex-col justify-center";

const formatPurchasedAt = (purchasedAt?: string): string => {
  if (!purchasedAt) return "-";
  const date = new Date(purchasedAt);
  if (Number.isNaN(date.getTime())) return "-";
  const pad = (value: number): string => String(value).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

const getUsageState = (
  count: number,
  remainingCount: number
): "미사용" | "사용 중" | "사용 완료" => {
  if (remainingCount >= count) return "미사용";
  if (remainingCount <= 0) return "사용 완료";
  return "사용 중";
};

export function TokenHistoryHeader(): JSX.Element {
  return (
    <div className="flex h-14 items-center border-y border-border">
      {COLUMNS.map((column) => (
        <div key={column.label} className={cn(cellClassName, column.className)}>
          <p className="text-sm text-text-secondary">{column.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function TokenHistory({
  orderName,
  count,
  remainingCount,
  paymentMethod,
  easyPayProvider,
  price,
  state,
  purchasedAt,
  RefundComponent
}: CamelCasedProperties<PurchaseHistory> & {
  RefundComponent: React.ReactNode;
}): JSX.Element {
  const usageState = getUsageState(count, remainingCount);

  return (
    <div className="flex h-[100px] items-center border-b border-border bg-bg-elevated">
      <div className={cn(cellClassName, COLUMNS[0].className)}>
        <p className="text-sm font-medium text-text-tertiary">
          {formatPurchasedAt(purchasedAt)}
        </p>
      </div>
      <div className={cn(cellClassName, COLUMNS[1].className)}>
        <p className="text-base font-semibold text-text-primary">{orderName}</p>
      </div>
      <div className={cn(cellClassName, COLUMNS[2].className)}>
        <p
          className={cn(
            "text-base",
            usageState === "사용 완료"
              ? "text-text-tertiary"
              : "font-medium text-text-primary"
          )}
        >
          {usageState}
        </p>
      </div>
      <div className={cn(cellClassName, COLUMNS[3].className)}>
        <p className="text-base font-medium text-text-primary">
          {paymentMethod}
          {easyPayProvider && ` (${easyPayProvider})`}
        </p>
      </div>
      <div className={cn(cellClassName, COLUMNS[4].className)}>
        <p className="text-base font-semibold text-primary">
          {price.toLocaleString()}원
        </p>
      </div>
      <div className={cn(cellClassName, COLUMNS[5].className)}>
        {state === "환불 가능" ? (
          RefundComponent
        ) : (
          <p className="text-base text-text-tertiary">환불 불가</p>
        )}
      </div>
    </div>
  );
}
