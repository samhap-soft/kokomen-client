import { cn } from "#utils/index.ts";
import { cva, VariantProps } from "class-variance-authority";
import React, { JSX, RefObject, useCallback, useEffect, useRef } from "react";

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
  ref?: RefObject<HTMLTextAreaElement>;
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
}: TextareaProps): JSX.Element => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      if (autoAdjust) {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight > 400 ? 400 : e.target.scrollHeight}px`;
      }
      if (props.onChange) {
        props.onChange(e);
      }
    },
    [autoAdjust, props.onChange]
  );

  return (
    <textarea
      className={cn(textareaVariants({ variant, size, border }), className)}
      ref={ref}
      onChange={handleChange}
      placeholder="Type your text here..."
      {...props}
    />
  );
};
