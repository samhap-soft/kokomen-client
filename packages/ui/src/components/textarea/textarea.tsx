import { cn } from "#utils/index.ts";
import { cva, VariantProps } from "class-variance-authority";
import React, { RefObject, useEffect, useRef } from "react";

type TextareaVariantProps = VariantProps<typeof textareaVariants>;
const textareaVariants = cva("flex items-center rounded-xl p-2 s resize-none", {
  variants: {
    variant: {
      default: "border-border-input",
      red: "border-red-600",
    },
    border: {
      default:
        "border hover:border-primary-hover transition-all focus:border-primary",
      none: "border-none focus:outline-none",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface TextareaProps
  extends Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      "size" | "children" | "dangerouslySetInnerHTML"
    >,
    TextareaVariantProps {
  ref?: RefObject<HTMLTextAreaElement | null>;
  autoAdjust?: boolean;
  name: string;
}

export const Textarea = ({
  className,
  variant,
  size,
  border,
  ref,
  autoAdjust = false,
  ...props
}: TextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const currentRef = ref || textareaRef;
  useEffect(() => {
    if (
      autoAdjust &&
      currentRef &&
      currentRef.current &&
      props.value !== undefined
    ) {
      const textarea = currentRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight > 400 ? 400 : textarea.scrollHeight}px`;
    }
  }, [props.value, autoAdjust, ref]);

  return (
    <textarea
      className={cn(textareaVariants({ variant, size, border }), className)}
      ref={ref}
      placeholder="Type your text here..."
      {...props}
    />
  );
};
