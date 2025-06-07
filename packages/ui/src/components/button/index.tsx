import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes, JSX, RefObject } from "react";
import { cn } from "../../utils/index.ts";

type ButtonVariantsProps = VariantProps<typeof buttonVariants>;

// eslint-disable-next-line @rushstack/typedef-var
const buttonVariants = cva(
  `flex cursor-pointer text-white rounded-xl text-center active:translate-y-0.5 items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        default: "bg-primary",
        outline: "bg-background-alt shadow-sm text-black",
        red: "bg-red-600",
      },
      border: {
        default: "border border-border-input",
        round: "border border-border-input rounded-full",
        none: "border-none focus:outline-none",
      },
      shadow: {
        default: "shadow-md shadow-gray-500",
        none: "shadow-none",
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
      border: "default",
      shadow: "default",
    },
  }
);

export interface IButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantsProps {
  children?: React.ReactNode;
  ref?: RefObject<HTMLButtonElement>;
  icon?: React.ReactNode | SVGElement;
}
export const Button = ({
  ref,
  variant,
  className,
  size,
  border,
  shadow,
  ...props
}: IButtonProps): JSX.Element => (
  <button
    ref={ref}
    className={cn(
      buttonVariants({
        variant,
        size,
        border,
        shadow,
      }),
      className
    )}
    {...props}
  />
);
