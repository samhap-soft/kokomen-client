import { cn } from "#utils/index.ts";
import { HTMLAttributes } from "react";

export function Layout({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        `min-w-[1280px] min-h-[720px] w-screen h-screen`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
