import { CamelCasedProperties, Product } from "@kokomen/types";
import { Button } from "../../button";
import { MoneyIcon } from "../../icon";
import { cn } from "../../../utils";
import { JSX } from "react";

interface TokenProps extends CamelCasedProperties<Product> {
  onPurchase?: () => void;
  className?: string;
}

// "토큰 10개" 처럼 상품명에 들어 있는 토큰 수. 형식이 다르면 null.
const parseTokenCount = (orderName: string): number | null => {
  const match = orderName.match(/(\d[\d,]*)\s*개/);
  return match ? Number(match[1].replace(/,/g, "")) : null;
};

/**
 * Figma: Purchase / Token product — 747:824
 *
 * 텍스트 면접은 질문당 1개, 음성 면접은 질문당 2개를 쓰므로
 * 부제의 문항 수는 토큰 수에서 계산한다.
 */
export default function Token({
  orderName,
  price,
  onPurchase,
  className
}: TokenProps): JSX.Element {
  const tokenCount = parseTokenCount(orderName);

  return (
    <div
      className={cn(
        "flex min-h-[104px] items-center justify-between gap-4 rounded-[20px] border border-border bg-bg-elevated px-4 py-4 sm:px-6",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex size-[52px] shrink-0 items-center justify-center rounded-2xl bg-primary-1">
          <MoneyIcon size={28} className="text-primary" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5 leading-normal">
          <p className="truncate text-[22px] font-semibold text-text-primary">
            {orderName}
          </p>
          {tokenCount !== null && (
            <p className="truncate text-sm text-text-secondary">
              텍스트 {tokenCount.toLocaleString()}문항 · 음성{" "}
              {Math.floor(tokenCount / 2).toLocaleString()}문항
            </p>
          )}
        </div>
      </div>
      <Button
        variant="secondary"
        size="large"
        className="shrink-0 sm:w-[114px]"
        onClick={onPurchase}
      >
        {price.toLocaleString()}원
      </Button>
    </div>
  );
}
