import { cn } from "../../utils/index.ts";
import { cva, VariantProps } from "class-variance-authority";
import React, { JSX, RefObject, useCallback } from "react";

type TextareaVariantProps = VariantProps<typeof textareaVariants>;

/**
 * Figma: Common/TextArea (완) — component set 54:907
 *
 * variant(default · red) x border(default · none) x size(default · sm · lg · xl) x
 * state(default · hover · filled · disabled).
 *
 * 공통: padding 12, radius 12, border 1px, 배경은 surface/neutral.
 * default variant 의 테두리는 stroke/brand → hover/focus 에서 stroke/brand-hovered,
 * red variant 는 stroke/error → hover/focus 에서 stroke/error-hovered 로 간다.
 * disabled 은 variant 와 무관하게 stroke/default 테두리 +
 * surface/neutral-container-disabled 배경을 쓴다.
 */
const textareaVariants = cva(
  "flex items-center rounded-xl p-3 resize-none bg-bg-base text-text-primary placeholder:text-text-placeholder transition-colors disabled:bg-bg-container-disabled disabled:text-text-disabled",
  {
    variants: {
      variant: {
        default: "border-primary-border",
        red: "border-error-border"
      },
      border: {
        default: "border disabled:border-border",
        none: "border-none focus:outline-none"
      },
      size: {
        default: "text-base",
        sm: "text-sm",
        lg: "text-lg",
        xl: "text-xl"
      }
    },
    defaultVariants: {
      variant: "default",
      border: "default",
      size: "default"
    },
    compoundVariants: [
      {
        variant: "default",
        border: "default",
        className:
          "hover:border-primary-border-hover focus:border-primary-border-hover"
      },
      {
        variant: "red",
        border: "default",
        className:
          "hover:border-error-border-hover focus:border-error-border-hover"
      }
    ]
  }
);

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
  onChange,
  ...props
}: TextareaProps): JSX.Element => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      if (autoAdjust) {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight > 400 ? 400 : e.target.scrollHeight}px`;
      }
      if (onChange) {
        onChange(e);
      }
    },
    [autoAdjust, onChange]
  );

  return (
    <textarea
      className={cn(textareaVariants({ variant, size, border }), className)}
      ref={ref}
      placeholder="Type your text here..."
      {...props}
      onChange={handleChange}
    />
  );
};
