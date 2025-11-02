import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes, JSX, RefObject } from "react";
import { cn } from "../../utils/index.ts";
import { RoundSpinner } from "../spinner";

type ButtonVariantsProps = VariantProps<typeof buttonVariants>;

// eslint-disable-next-line @rushstack/typedef-var
const buttonVariants = cva(
  `flex cursor-pointer text-text-light-solid rounded-xl text-center items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0 disabled:text-text-disabled disabled:bg-bg-container-disabled transition-all duration-200 ease-in-out`,
  {
    variants: {
      variant: {
        default:
          "bg-bg-base text-text-label outline-border hover:text-primary-bg-hover hover:outline-primary-hover active:outline-primary-active active:text-primary-active outline-1 shadow-sm hover:shadow-md",
        primary:
          "bg-primary text-text-light-solid hover:bg-orange-5 hover:shadow-lg transform hover:scale-105",
        dashed:
          "text-primary-text outline-border-secondary hover:outline-primary-border-hover focus:outline-primary outline-dashed outline-2 hover:text-primary-hover bg-transparent",
        text: "text-text-primary hover:bg-bg-text-hover active:bg-bg-text-active bg-transparent",
        link: "text-primary hover:text-primary-hover underline-offset-4 hover:underline bg-transparent",
        cancel:
          "bg-bg-base text-text-label outline-border hover:text-primary-hover hover:outline-primary-hover active:outline-primary-active active:text-primary-active outline-1 shadow-sm hover:shadow-md",
        success:
          "bg-success hover:bg-success-hover active:bg-success-active text-text-light-solid shadow-lg hover:shadow-xl transform hover:scale-105",
        warning:
          "bg-warning hover:bg-warning-hover active:bg-warning-active text-text-light-solid shadow-lg hover:shadow-xl transform hover:scale-105",
        info: "bg-info hover:bg-info-hover active:bg-info-active text-text-light-solid shadow-lg hover:shadow-xl transform hover:scale-105",
        submit: "bg-blue-5 text-text-light-solid active:bg-blue-6",
        gradient:
          "bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary-active text-text-light-solid shadow-lg hover:shadow-xl transform hover:scale-105",
        gradientSuccess:
          "bg-gradient-to-r from-success to-success-hover hover:from-success-hover hover:to-success-active text-text-light-solid shadow-lg hover:shadow-xl transform hover:scale-105",
        gradientPurple:
          "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-text-light-solid shadow-lg hover:shadow-xl transform hover:scale-105",
        outline:
          "bg-transparent text-text-primary border-2 border-border hover:bg-primary hover:text-text-light-solid active:bg-primary-active active:text-text-light-solid shadow-sm hover:shadow-md",
        outlineSuccess:
          "bg-transparent text-success border-2 border-success hover:bg-success hover:text-text-light-solid active:bg-success-active active:text-text-light-solid shadow-sm hover:shadow-md",
        outlineWarning:
          "bg-transparent text-warning border-2 border-warning hover:bg-warning hover:text-text-light-solid active:bg-warning-active active:text-text-light-solid shadow-sm hover:shadow-md",
        soft: "bg-primary-bg-light text-primary shadow-sm hover:shadow-md",
        softSuccess:
          "bg-success-bg text-success hover:bg-success-bg-hover active:bg-success-border shadow-sm hover:shadow-md",
        softWarning:
          "bg-warning-bg text-warning hover:bg-warning-bg-hover active:bg-warning-border shadow-sm hover:shadow-md",
        glass:
          "bg-white/20 backdrop-blur-md border border-white/30 text-text-primary hover:bg-white/30 hover:border-white/50 shadow-lg hover:shadow-xl",
        neon: "bg-primary text-text-light-solid shadow-[0_0_20px_rgba(22,104,220,0.5)] hover:shadow-[0_0_30px_rgba(22,104,220,0.7)] transform hover:scale-105",
        none: ""
      },
      size: {
        default: "px-4 py-2 text-sm",
        small: "px-3 py-1.5 text-xs",
        large: "px-6 py-3 text-lg",
        xl: "px-8 py-4 text-xl"
      },
      round: {
        true: "rounded-full",
        false: "rounded-xl"
      },
      danger: {
        true: "",
        false: ""
      },
      optimistic: {
        true: "",
        false: ""
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    },
    compoundVariants: [
      {
        variant: "primary",
        danger: true,
        className: "bg-error hover:bg-error-hover active:bg-error-active"
      },
      {
        variant: "default",
        danger: true,
        className:
          "outline-error text-error hover:outline-error-hover hover:text-error-hover active:outline-error-active active:text-error-active"
      },
      {
        variant: "dashed",
        danger: true,
        className:
          "outline-error text-error hover:outline-error-hover hover:text-error-hover active:outline-error-active active:text-error-active"
      },
      {
        variant: "text",
        danger: true,
        className:
          "text-error hover:bg-error-bg active:text-error-active active:bg-error-bg"
      },
      {
        variant: "link",
        danger: true,
        className: "text-error active:text-error-active"
      },
      {
        variant: "outline",
        danger: true,
        className:
          "text-error border-error hover:bg-error hover:text-text-light-solid active:bg-error-active"
      },
      {
        variant: "soft",
        danger: true,
        className:
          "bg-error-bg text-error hover:bg-error-bg-hover active:bg-error-border"
      },
      {
        variant: "gradient",
        danger: true,
        className:
          "bg-gradient-to-r from-error to-error-hover hover:from-error-hover hover:to-error-active"
      },
      {
        variant: "glass",
        optimistic: true,
        className:
          "disabled:!bg-volcano-3 disabled:!text-volcano-6 disabled:!opacity-100"
      }
    ]
  }
);

export interface IButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantsProps {
  children?: React.ReactNode;
  ref?: RefObject<HTMLButtonElement>;
  icon?: React.ReactNode | SVGElement;
  pendingText?: string;
  pendingSpinner?: boolean;
}
export const Button = ({
  ref,
  variant,
  className,
  size,
  round = false,
  danger = false,
  optimistic = false,
  pendingSpinner = false,
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
        optimistic
      }),
      className
    )}
    {...props}
  >
    {props.disabled && pendingSpinner ? (
      <>
        <RoundSpinner />
        <span className="text-text-secondary">
          {props.pendingText ?? "제출중.."}
        </span>
      </>
    ) : (
      props.children
    )}
  </button>
);
