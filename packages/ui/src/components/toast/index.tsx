import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "../../utils/index.ts";

// Toast Position
type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

const positionClasses: Record<ToastPosition, string> = {
  "top-left":
    "fixed top-4 left-4 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[420px]",
  "top-center":
    "fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[420px]",
  "top-right":
    "fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[420px]",
  "bottom-left":
    "fixed bottom-4 left-4 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]",
  "bottom-center":
    "fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]",
  "bottom-right":
    "fixed bottom-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]"
};

// Toast Provider - Context를 제공하는 컴포넌트
interface ToastContextType {
  addToast: (toast: ToastProps) => string;
  removeToast: (id: string) => void;
  toasts: ToastProps[];
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = React.useCallback(
    (toast: ToastProps) => {
      const id = toast.id || Math.random().toString(36).substring(2, 15);
      const newToast = { ...toast, id, isVisible: true };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // 최대 5개까지만 표시

      // 자동 제거 타이머
      if (toast.duration !== Infinity) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration || 5000);
      }

      return id;
    },
    [removeToast]
  );

  const value = React.useMemo(
    () => ({
      addToast,
      removeToast,
      toasts
    }),
    [addToast, removeToast, toasts]
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

function useToastContext() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
}

interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: ToastPosition;
}

const ToastViewport = React.forwardRef<HTMLDivElement, ToastViewportProps>(
  ({ className, position = "top-center", ...props }, ref) => {
    const { toasts } = useToastContext();
    return (
      <div
        ref={ref}
        className={cn(
          positionClasses[position],
          toasts.length === 0 && "hidden",
          className
        )}
        {...props}
      />
    );
  }
);
ToastViewport.displayName = "ToastViewport";

// Toast Variants
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-lg transition-all duration-300 ease-out transform",
  {
    variants: {
      variant: {
        default:
          "border-border bg-bg-elevated text-text-primary shadow-box-shadow",
        success:
          "border-success-border bg-success-bg text-success-text shadow-box-shadow",
        error:
          "border-error-border bg-error-bg text-error-text shadow-box-shadow",
        warning:
          "border-warning-border bg-warning-bg text-warning-text shadow-box-shadow",
        info: "border-info-border text-info-text shadow-box-shadow bg-white"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

// Toast 컴포넌트
interface ToastProps extends VariantProps<typeof toastVariants> {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  duration?: number;
  isVisible?: boolean;
  onClose?: () => void;
  className?: string;
  position?: ToastPosition;
}

const getSlideDirection = (position: ToastPosition = "top-center") => {
  const isBottom = position.startsWith("bottom");
  if (position.includes("left"))
    return isBottom ? "translateY(100%)" : "translateY(-100%)";
  if (position.includes("center"))
    return isBottom ? "translateY(20px)" : "translateY(-20px)";
  return isBottom ? "translateY(100%)" : "translateY(-100%)";
};

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant,
      title,
      description,
      action,
      onClose,
      isVisible = true,
      position = "bottom-right",
      ...props
    },
    ref
  ) => {
    const [isExiting, setIsExiting] = React.useState(false);
    const [isEntering, setIsEntering] = React.useState(true);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, 300);
      return () => clearTimeout(timer);
    }, []);

    React.useEffect(() => {
      if (!isVisible && !isExiting) {
        setIsExiting(true);
        const timer = setTimeout(() => {
          onClose?.();
        }, 300); // 애니메이션 완료 후 제거
        return () => clearTimeout(timer);
      }
    }, [isVisible, isExiting, onClose]);

    const handleClose = () => {
      setIsExiting(true);
      setTimeout(() => {
        onClose?.();
      }, 500);
    };

    const getIcon = () => {
      switch (variant) {
        case "success":
          return <CheckCircle className="h-5 w-5 text-success" />;
        case "error":
          return <AlertCircle className="h-5 w-5 text-error" />;
        case "warning":
          return <AlertTriangle className="h-5 w-5 text-warning" />;
        case "info":
          return <Info className="h-5 w-5 text-info" />;
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        style={{
          transform: isEntering
            ? `${getSlideDirection(position)} scale(0.95)`
            : "translate(0) scale(1)",
          opacity: isEntering || isExiting ? 0 : 1
        }}
        {...props}
      >
        <div className="flex items-start gap-3 flex-1">
          {getIcon()}
          <div className="flex-1">
            {title && <div className="text-sm font-semibold mb-1">{title}</div>}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
          </div>
        </div>

        {action && <div className="flex items-center gap-2">{action}</div>}

        <button
          onClick={handleClose}
          className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:bg-black/10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);
Toast.displayName = "Toast";

// Toast Action 컴포넌트
interface ToastActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
ToastAction.displayName = "ToastAction";

// Toast Close 컴포넌트
interface ToastCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:bg-black/10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring group-hover:opacity-100",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  )
);
ToastClose.displayName = "ToastClose";

// Toast Title 컴포넌트
interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

const ToastTitle = React.forwardRef<HTMLDivElement, ToastTitleProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
);
ToastTitle.displayName = "ToastTitle";

// Toast Description 컴포넌트
interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  ToastDescriptionProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
));
ToastDescription.displayName = "ToastDescription";

// Toast 컨테이너 컴포넌트
const ToastContainer = () => {
  const { toasts, removeToast } = useToastContext();

  const groupedByPosition = toasts.reduce<Record<ToastPosition, ToastProps[]>>(
    (acc, toast) => {
      const pos = toast.position || "top-center";
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(toast);
      return acc;
    },
    {} as Record<ToastPosition, ToastProps[]>
  );

  return (
    <>
      {(
        Object.entries(groupedByPosition) as [ToastPosition, ToastProps[]][]
      ).map(([position, positionToasts]) => (
        <ToastViewport key={position} position={position}>
          {positionToasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={() => removeToast(toast.id!)}
            />
          ))}
        </ToastViewport>
      ))}
    </>
  );
};
interface ToasterProps {
  children: React.ReactNode;
}
const Toaster = ({ children }: ToasterProps) => {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
};

type ToastActionElement = React.ReactElement<typeof ToastAction>;

interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  duration?: number;
  variant?: "default" | "success" | "error" | "warning" | "info";
  position?: ToastPosition;
}

function useToast() {
  const { addToast, removeToast, toasts } = useToastContext();

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = addToast(options);

      return {
        id,
        dismiss: () => removeToast(id)
      };
    },
    [addToast, removeToast]
  );

  const success = React.useCallback(
    (options: Omit<ToastOptions, "variant">) => {
      return toast({ ...options, variant: "success" });
    },
    [toast]
  );

  const error = React.useCallback(
    (options: Omit<ToastOptions, "variant">) => {
      return toast({ ...options, variant: "error" });
    },
    [toast]
  );

  const warning = React.useCallback(
    (options: Omit<ToastOptions, "variant">) => {
      return toast({ ...options, variant: "warning" });
    },
    [toast]
  );

  const info = React.useCallback(
    (options: Omit<ToastOptions, "variant">) => {
      return toast({ ...options, variant: "info" });
    },
    [toast]
  );

  return {
    toast,
    success,
    error,
    warning,
    info,
    dismiss: removeToast,
    toasts
  };
}

// 타입 내보내기
export type {
  ToastPosition,
  ToastProps,
  ToastActionProps,
  ToastCloseProps,
  ToastTitleProps,
  ToastDescriptionProps,
  ToastActionElement
};
export {
  Toaster,
  useToastContext,
  ToastProvider,
  useToast,
  ToastViewport,
  Toast,
  ToastAction,
  ToastClose,
  ToastTitle,
  ToastDescription
};
