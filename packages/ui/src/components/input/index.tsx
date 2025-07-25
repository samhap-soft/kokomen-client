import { cn } from "#utils/index.ts";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";

type InputVariantProps = VariantProps<typeof inputVariants>;
const inputVariants = cva(
  "flex items-center rounded-md p-2 outline-border-input bg-gray- outline-2 outline-primary-border hover:outline-primary-hover transition-all focus:outline-primary-active",
  {
    variants: {
      variant: {
        default: "border-gray-300",
        outline: "border-borderinput",
        red: "border-red-600"
      },
      size: {
        default: "text-base",
        sm: "text-sm",
        lg: "text-lg",
        xl: "text-xl",
        "2xl": "text-2xl"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

interface InputProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "size" | "children" | "dangerouslySetInnerHTML"
    >,
    InputVariantProps {
  ref?: React.Ref<HTMLInputElement>;
  children?: React.ReactNode;
  name?: string; // optional로 변경
}
export const Input = ({
  variant,
  type,
  className,
  size,
  ref,
  name,
  ...props
}: InputProps) => (
  <input
    dangerouslySetInnerHTML={undefined}
    ref={ref}
    type={type}
    className={cn(inputVariants({ variant, size }), className)}
    id={name}
    {...props}
  />
);
