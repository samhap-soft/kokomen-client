import { CamelCasedProperties, PurchaseHistory } from "@kokomen/types";
import { Coins } from "lucide-react";
import React from "react";

export default function TokenHistory({
  orderName,
  remainingCount,
  paymentMethod,
  easyPayProvider,
  price,
  state,
  RefundComponent
}: CamelCasedProperties<PurchaseHistory> & {
  RefundComponent: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between border-b border-border p-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 border border-primary-border bg-primary-bg rounded-full flex justify-center items-center">
          <Coins className="w-6 h-6 text-primary" />
        </div>
        <div className="text-start">
          <div className="text-lg font-bold">{orderName}</div>
          <span>
            {remainingCount ? `${remainingCount}개 사용가능` : "사용완료"}
          </span>
        </div>
      </div>
      <div className="flex gap-4 text-text-description items-center">
        <div>
          {paymentMethod}
          {easyPayProvider && `(${easyPayProvider})`}
        </div>
        <div>{price.toLocaleString()}원</div>
        <div>{state === "환불 가능" ? RefundComponent : "환불 불가"}</div>
      </div>
    </div>
  );
}
