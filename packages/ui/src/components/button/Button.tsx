import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes, RefObject } from "react";
import { cn } from "../../utils/index.js";

type buttonVariantsProps = VariantProps<typeof buttonVariants>;
const buttonVariants = cva(
  `flex [&_svg]:size-5 text-white rounded-xl shadow-md shadow-gray-500 cursor-pointer text-center active:translate-y-1 border border-border-input`,
  {
    variants: {
      variant: {
        default: "bg-primary",
        outline: "bg-background-alt shadow-sm text-black",
        red: "bg-red-600",
      },
      size: {
        default: "px-6 py-2",
        sm: "px-4 py-1 text-sm",
        lg: "px-6 py-3 text-lg",
        xl: "px-8 py-4 text-xl",
        "2xl": "px-10 py-3 text-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends HTMLAttributes<HTMLButtonElement>,
    buttonVariantsProps {
  children: React.ReactNode;
  ref?: RefObject<HTMLButtonElement>;
  icon?: React.ReactNode | SVGElement;
}
export const Button = ({ ref, variant, size, ...props }: ButtonProps) => (
  <button
    ref={ref}
    className={cn(
      buttonVariants({
        variant,
        size,
      }),
      props.className
    )}
    {...props}
  >
    {props.children}
  </button>
);
