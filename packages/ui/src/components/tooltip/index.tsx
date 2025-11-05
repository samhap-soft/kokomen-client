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

  const getArrowClasses = (): string => {
    switch (placement) {
      case "top":
        return "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800";
      case "bottom":
        return "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800";
      case "left":
        return "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800";
      case "right":
        return "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800";
      default:
        return "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800";
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
      <div className={cn("absolute w-0 h-0 border-4", getArrowClasses())} />
    </div>
  );
}

const Tooltip = Object.assign(TooltipContainer, {
  Content: TooltipContent
});

export default Tooltip;
