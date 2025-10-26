import { CamelCasedProperties, Product } from "@kokomen/types";
import { Button } from "../../button";
import { cn } from "../../../utils";
import { JSX } from "react";
import { Coins } from "lucide-react";

interface TokenProps extends CamelCasedProperties<Product> {
  onPurchase?: () => void;
  className?: string;
}

export default function Token({
  orderName,
  price,
  onPurchase,
  className
}: TokenProps): JSX.Element {
  const formattedPrice = price.toLocaleString();

  return (
    <div
      className={cn(
        "border border-border-secondary flex justify-between p-4 items-center",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Coins className="w-5 h-5 text-primary" />
        {orderName}
      </div>
      <Button
        variant="primary"
        size="default"
        className="px-6 font-bold"
        onClick={onPurchase}
      >
        {formattedPrice}원
      </Button>
    </div>
  );
}
