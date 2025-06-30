import {
  Toast,
  ToastProvider,
  ToastViewport,
  useToastContext,
} from "#components/toast/index.tsx";
import { JSX } from "react";

interface ToasterProps {
  children: React.ReactNode;
}

export function Toaster({ children }: ToasterProps): JSX.Element {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}

// Toast 컨테이너 컴포넌트
function ToastContainer(): JSX.Element {
  const { toasts, removeToast } = useToastContext();

  return (
    <ToastViewport>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id!)}
        />
      ))}
    </ToastViewport>
  );
}
