import {
  AppleLoginInput,
  CREATE_APPLE_LOGIN_MUTATION
} from "@/domains/auth/api/gql";
import { useAuthStore } from "@/store";
import { useApolloClient } from "@apollo/client/react";
import { WebviewMessage } from "@kokomen/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";

function useLogin(defaultRedirectTo: string = "/interviews") {
  const ROOT_URI = "/interviews";
  const client = useApolloClient();
  const router = useRouter();

  const query = useSearch({
    from: "/login/",
    select: (search) => search as { redirectTo?: string }
  });
  const redirectTo = query.redirectTo || defaultRedirectTo;

  const appleAuthMutation = useMutation({
    mutationFn: async (input: AppleLoginInput) => {
      return client.mutate({
        mutation: CREATE_APPLE_LOGIN_MUTATION,
        variables: { input }
      });
    },
    onSuccess: ({ data }: any) => {
      const authData = data.appleAuth;
      useAuthStore.getState().setAuth(authData);
      if (!authData.profile_completed) {
        router.navigate({
          to: `${redirectTo}`
        });
        return;
      }
      const redirectPath = query.redirectTo || ROOT_URI;
      router.navigate({ to: redirectPath, replace: true });
    },
    onError: (error) => {
      console.error("Apple 로그인 실패:", error.message);
      alert("Apple 로그인에 실패했습니다. 다시 시도해주세요.");
    }
  });

  const onAppleLogin = () => {
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({
        type: "appleLogin"
      })
    );
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(
          event.data
        ) as WebviewMessage<AppleLoginInput>;

        if (message.type === "appleLoginResult" && message.data) {
          appleAuthMutation.mutate(message.data);
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    if (window.ReactNativeWebView) {
      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, [appleAuthMutation]);

  return { onAppleLogin, isAppleLoginLoading: appleAuthMutation.isPending };
}

export default useLogin;
