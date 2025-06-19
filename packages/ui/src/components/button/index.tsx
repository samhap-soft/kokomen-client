import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes, JSX, RefObject } from "react";
import { cn } from "../../utils/index.ts";

type ButtonVariantsProps = VariantProps<typeof buttonVariants>;

// eslint-disable-next-line @rushstack/typedef-var
const buttonVariants = cva(
  `flex cursor-pointer text-text-light-solid rounded-xl text-center items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0 disabled:text-text-disabled disabled:bg-bg-container-disabled`,
  {
    variants: {
      variant: {
        default:
          "bg-bg-base text-text-label outline-border hover:text-primary-hover hover:outline-primary-hover active:outline-primary-active active:text-primary-active outline-1",
        primary:
          "bg-primary active:bg-primary-active hover:bg-primary-hover  text-text-light-solid",
        dashed:
          "text-primary-text outline-border-secondary hover:outline-primary-border-hover  focus:outline-primary outline-dashed outline-2 hover:text-primary-hover",
        text: "text-text-primary hover:bg-bg-text-hover active:bg-bg-text-active",
        link: "text-primary",
      },
      size: {
        default: "p-sm text-sm",
        small: "p-xs text-xs",
        large: "p-md text-xl",
      },
      round: {
        true: "rounded-full",
        false: "rounded-md",
      },
      danger: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
    compoundVariants: [
      {
        variant: "primary",
        danger: true,
        className: "bg-error hover:bg-error-hover active:bg-error-active",
      },
      {
        variant: "default",
        danger: true,
        className:
          "outline-error text-error hover:outline-error-hover hover:text-error-hover active:outline-error-active active:text-error-active",
      },
      {
        variant: "dashed",
        danger: true,
        className:
          "outline-error text-error hover:outline-error-hover hover:text-error-hover active:outline-error-active active:text-error-active",
      },
      {
        variant: "text",
        danger: true,
        className:
          " text-error hover:bg-error-bg active:text-error-active active:bg-error-bg",
      },
      {
        variant: "link",
        danger: true,
        className: "text-error active:text-error-active",
      },
    ],
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
  round = false,
  danger = false,
  ...props
}: IButtonProps): JSX.Element => (
  <button
    ref={ref}
    className={cn(
      buttonVariants({
        variant,
        size,
        round,
        danger,
      }),
      className
    )}
    {...props}
  />
);
