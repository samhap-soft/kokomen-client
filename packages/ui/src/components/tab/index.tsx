import { ButtonHTMLAttributes, HTMLAttributes, JSX, ReactNode } from "react";
import { cn } from "../../utils/index.ts";

/**
 * Figma: Tab — component 570:51 (Tab Item 570:32 · 570:34)
 *
 * 흰 배경 위에 아이템을 나란히 놓는 세그먼트형 탭이다. 명세된 size 는 large 하나다.
 *   container padding 4 · gap 8 · radius 12 · surface/neutral
 *   item      padding 12/20 · radius 10 · text lg/semi-bold
 *   selected  surface/fill 배경 + onsurface/neutral
 *   default   배경 없음 + onsurface/neutral-subtle
 * disabled 는 Figma 에 없어서 Button 과 같은 disabled 토큰을 쓴다.
 */
function TabRoot({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }): JSX.Element {
  return (
    <div
      role="tablist"
      className={cn("flex items-stretch gap-2 rounded-xl bg-bg-elevated p-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  selected?: boolean;
  children?: ReactNode;
}

function TabItem({
  selected = false,
  className,
  children,
  ...props
}: TabItemProps): JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={cn(
        "flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-[10px] px-5 py-3 text-lg font-semibold whitespace-nowrap transition-colors duration-200 [&_svg]:size-6 [&_svg]:shrink-0",
        selected ? "bg-fill text-text-primary" : "text-text-tertiary hover:bg-fill-tertiary",
        "disabled:cursor-not-allowed disabled:bg-transparent disabled:text-text-disabled",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export const Tab: typeof TabRoot & { Item: typeof TabItem } = Object.assign(TabRoot, {
  Item: TabItem
});
