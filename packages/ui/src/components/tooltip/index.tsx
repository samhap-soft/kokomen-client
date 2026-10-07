import { ReactNode, HTMLAttributes, ReactElement } from "react";
import { cn } from "../../utils/index.ts";

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function TooltipContainer({
  children,
  className,
  ...props
}: TooltipProps): ReactElement {
  return (
    <div className={cn("relative inline-block group", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Figma: Component/Tooltip (완) — component set 166:69
 *
 * placement(top · bottom · left · right). content 는 padding 8/12 · radius 6 ·
 * neutral/800 배경 · sm/regular 흰 글자 · shadow/lg 이고, arrow 는 9x9 사각형을
 * 45도 회전한 모양이다.
 */
interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
}

export function TooltipContent({
  children,
  placement = "top",
  className,
  ...props
}: TooltipContentProps): ReactElement {
  const getPlacementClasses = (): string => {
    switch (placement) {
      case "top":
        return "bottom-full left-1/2 -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 -translate-y-1/2 ml-2";
      default:
        return "bottom-full left-1/2 -translate-x-1/2 mb-2";
    }
  };

  // Figma 의 arrow 는 9x9 사각형을 45도 돌린 모양이다 (삼각형 border 가 아님).
  const getArrowClasses = (): string => {
    switch (placement) {
      case "bottom":
        return "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2";
      case "left":
        return "left-full top-1/2 -translate-x-1/2 -translate-y-1/2";
      case "right":
        return "right-full top-1/2 translate-x-1/2 -translate-y-1/2";
      case "top":
      default:
        return "top-full left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
  };

  return (
    <div
      role="tooltip"
      className={cn(
        "absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap pointer-events-none",
        "opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible",
        "transition-opacity duration-200",
        getPlacementClasses(),
        className
      )}
      {...props}
    >
      {children}
      <div
        className={cn(
          "absolute size-[9px] rotate-45 bg-gray-800",
          getArrowClasses()
        )}
      />
    </div>
  );
}

const Tooltip = Object.assign(TooltipContainer, {
  Content: TooltipContent
});

export default Tooltip;
