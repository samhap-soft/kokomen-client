import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "#components/button/index.tsx";
import { X } from "lucide-react";
import { cn } from "#utils/index.ts";

// Sidebar 스타일 variants
const sidebarVariants = cva(
  "bg-white shadow-2xl transition-all duration-300 ease-out flex flex-col overflow-hidden pt-18 absolute w-full md:w-[500px] h-full",
  {
    variants: {
      placement: {
        left: "left-0 top-0",
        right: "right-0 top-0",
        top: "top-0 left-0 ",
        bottom: "bottom-0 left-0",
      },
      size: {
        default: "text-sm",
        large: "text-base",
      },
      state: {
        open: "",
        closed: "",
      },
    },
    compoundVariants: [
      {
        placement: "left",
        state: "open",
        className: "translate-x-0",
      },
      {
        placement: "left",
        state: "closed",
        className: "-translate-x-full",
      },
      {
        placement: "right",
        state: "open",
        className: "translate-x-0",
      },
      {
        placement: "right",
        state: "closed",
        className: "translate-x-full",
      },
      {
        placement: "top",
        state: "open",
        className: "translate-y-0",
      },
      {
        placement: "top",
        state: "closed",
        className: "-translate-y-full",
      },
      {
        placement: "bottom",
        state: "open",
        className: "translate-y-0",
      },
      {
        placement: "bottom",
        state: "closed",
        className: "translate-y-full",
      },
    ],
    defaultVariants: {
      placement: "right",
      size: "default",
      state: "closed",
    },
  }
);

interface SidebarProps extends VariantProps<typeof sidebarVariants> {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
  closable?: boolean;
  className?: string;
  bodyClassName?: string;
  destroyOnClose?: boolean;
  zIndex?: "default" | "high" | "higher";
}

const zIndexMap = {
  default: "z-30",
  high: "z-40",
  higher: "z-50",
};

const defaultProps: Partial<SidebarProps> = {
  width: 500,
  placement: "right",
  closable: true,
  zIndex: "default",
  size: "default",
  destroyOnClose: false,
};

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const {
    open,
    onClose,
    children,
    placement,
    closable,
    className,
    bodyClassName,
    size,
    destroyOnClose,
    zIndex,
  } = { ...defaultProps, ...props };

  if (destroyOnClose && !open) {
    return null;
  }
  const sidebarZIndex = zIndexMap[zIndex ?? "default"];

  return (
    <div
      className={cn(
        "fixed inset-0",
        open ? "pointer-events-auto" : "pointer-events-none",
        sidebarZIndex
      )}
    >
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          sidebarVariants({
            placement,
            size,
            state: open ? "open" : "closed",
            className,
          }),
          "transition-transform duration-300",
          "md:w-[500px]"
        )}
      >
        {/* Close Button */}
        {closable && (
          <div className="absolute top-4 right-4 z-10">
            <Button variant="text" onClick={onClose} aria-label="Close">
              <X />
            </Button>
          </div>
        )}

        {/* Body */}
        <div className={cn("flex-1 overflow-y-auto", bodyClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
};
