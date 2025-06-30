import { useToastContext } from "#components/toast/index.tsx";
import * as React from "react";

interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  duration?: number;
  variant?: "default" | "success" | "error" | "warning" | "info";
}

export function useToast() {
  const { addToast, removeToast, toasts } = useToastContext();

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 15);

      addToast({
        ...options,
        id,
        onClose: () => removeToast(id),
      });

      return {
        id,
        dismiss: () => removeToast(id),
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
    toasts,
  };
}

// 전역 toast 함수 (Provider 외부에서 사용할 때)
let globalToast: ReturnType<typeof useToast> | null = null;

export function setGlobalToast(toastInstance: ReturnType<typeof useToast>) {
  globalToast = toastInstance;
}

export function getGlobalToast() {
  return globalToast;
}

// 편의 함수들
export const toast = (
  options: Parameters<ReturnType<typeof useToast>["toast"]>[0]
) => {
  if (globalToast) {
    return globalToast.toast(options);
  }
  console.warn("Toast not available. Make sure to use ToastProvider.");
};

export const successToast = (
  options: Parameters<ReturnType<typeof useToast>["success"]>[0]
) => {
  if (globalToast) {
    return globalToast.success(options);
  }
  console.warn("Toast not available. Make sure to use ToastProvider.");
};

export const errorToast = (
  options: Parameters<ReturnType<typeof useToast>["error"]>[0]
) => {
  if (globalToast) {
    return globalToast.error(options);
  }
  console.warn("Toast not available. Make sure to use ToastProvider.");
};

export const warningToast = (
  options: Parameters<ReturnType<typeof useToast>["warning"]>[0]
) => {
  if (globalToast) {
    return globalToast.warning(options);
  }
  console.warn("Toast not available. Make sure to use ToastProvider.");
};

export const infoToast = (
  options: Parameters<ReturnType<typeof useToast>["info"]>[0]
) => {
  if (globalToast) {
    return globalToast.info(options);
  }
  console.warn("Toast not available. Make sure to use ToastProvider.");
};
