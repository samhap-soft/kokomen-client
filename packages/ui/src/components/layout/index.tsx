import { cn } from "../../utils/index.ts";
import { HTMLAttributes } from "react";

export function Layout({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div
      className={cn(`min-h-[720px] h-screen w-screen`, className)}
      {...props}
    >
      {children}
    </div>
  );
}
