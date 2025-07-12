import { logout } from "@/domains/auth/api";
import { captureButtonEvent } from "@/utils/analytics";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

export const useLogout = () => {
  const logoutMutation = useMutation({
    mutationFn: logout,
    onMutate: () => {
      captureButtonEvent({
        name: "userLogout",
      });
    },
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: () => {
      window.location.href = "/";
    },
  });

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return {
    logout: handleLogout,
    isLoggingOut: logoutMutation.isPending,
  };
};
