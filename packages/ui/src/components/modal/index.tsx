import { cva, VariantProps } from "class-variance-authority";
import React, { JSX, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../button";
import { cn } from "../../utils/index.ts";

type ModalVariants = VariantProps<typeof modalVariants>;
const modalVariants = cva(
  "relative bg-white rounded-lg shadow-xl w-full mx-4 transform transition-all animate-modal-pop-in",
  {
    variants: {
      size: {
        sm: "max-w-sm max-h-96",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        full: "max-w-full"
      }
    }
  }
);

const modalBodyVariants = cva("p-6 overflow-y-auto", {
  variants: {
    size: {
      sm: "max-h-96",
      md: "max-h-[450px]",
      lg: "max-h-[500px]",
      xl: "max-h-[550px]",
      "2xl": "max-h-[600px]",
      "3xl": "max-h-[650px]",
      "4xl": "max-h-[700px]",
      full: "max-h-full"
    }
  }
});

interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ModalVariants {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children: React.ReactNode;
  escToClose?: boolean;
  backdropClose?: boolean;
  closeButton?: boolean;
}
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  closeButton = true,
  backdropClose = false,
  size = "md",
  escToClose = false
}: ModalProps): JSX.Element | null => {
  useEffect(() => {
    if (!escToClose) return;
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, escToClose]);

  const backdropCloseHandler = useCallback(() => {
    if (backdropClose) {
      onClose();
    }
  }, [backdropClose, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50  transition-opacity"
        onClick={backdropCloseHandler}
      />

      {/* Modal */}
      <div className={cn(modalVariants({ size }), className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {closeButton && (
            <Button
              variant={"text"}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </Button>
          )}
        </div>

        {/* Body */}
        <div className={cn(modalBodyVariants({ size }))}>{children}</div>
      </div>
    </div>
  );
};
export { Modal };
