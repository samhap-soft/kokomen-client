import { postAuthorizationCode } from "@/domains/auth/api";
import { useMutation } from "@tanstack/react-query";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const { code, state } = router.query;

  const authMutation = useMutation({
    mutationFn: ({
      code,
      redirectUri,
    }: {
      code: string;
      redirectUri: string;
    }) => postAuthorizationCode(code, redirectUri),

    onSuccess: (data) => {
      console.log("로그인 성공:", data);

      // 로그인 성공 시 리다이렉트
      const redirectTo = (state as string) || "/";
      router.replace(redirectTo);
    },

    onError: () => {
      router.replace({ pathname: "/" });
    },
    retry: 1,
  });

  useEffect(() => {
    if (!router.isReady || authMutation.isPending || authMutation.error) return;

    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/login/callback`;

    authMutation.mutate({
      code: code as string,
      redirectUri,
    });
  }, [router.isReady, code, state, authMutation]);

  if (authMutation.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="animate-spin w-8 h-8 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              로그인 처리 중...
            </h2>
            <p className="text-gray-600">카카오 로그인을 완료하고 있습니다</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { code } = context.query;

  // Authorization code가 없는 경우
  if (!code) {
    return {
      redirect: {
        destination: "/500",
        permanent: false,
      },
    };
  }
  return {
    props: {}, // 이 페이지는 클라이언트에서 처리하므로 빈 props 반환
  };
};
