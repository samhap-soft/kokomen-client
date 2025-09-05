import { cn } from "../../utils/index.ts";
import { HtmlHTMLAttributes } from "react";

export default function Skeleton(props: HtmlHTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse", props.className)} {...props} />;
}
