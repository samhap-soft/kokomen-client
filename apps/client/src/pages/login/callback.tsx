import { postAuthorizationCode } from "@/domains/auth/api";
import { useMutation } from "@tanstack/react-query";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useRouter } from "next/router";
import { JSX, useEffect } from "react";
import Link from "next/link";

type KakaoCallbackPageProps = {
  code: string;
  state: string;
};

export default function KakaoCallbackPage({
  code,
  state
}: KakaoCallbackPageProps): JSX.Element | null {
  const router = useRouter();

  const authMutation = useMutation({
    mutationFn: ({
      code,
      redirectUri
    }: {
      code: string;
      redirectUri: string;
    }) => postAuthorizationCode(code, redirectUri),

    onSuccess: ({ data }) => {
      if (!data.profile_completed) {
        router.replace(`/login/profile?state=${state || "/"}`);
        return;
      }

      const redirectTo = state || "/";
      router.replace(redirectTo);
    },

    onError: (error) => {
      console.error("로그인 실패:", error);
    },
    retry: 1
  });

  useEffect(() => {
    if (
      !router.isReady ||
      authMutation.isPending ||
      authMutation.error ||
      authMutation.isSuccess
    )
      return;

    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/login/callback`;

    authMutation.mutate({
      code: code as string,
      redirectUri
    });
  }, [router.isReady, code, state, authMutation]);

  // 로딩 상태
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

  // 성공 상태
  if (authMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              로그인 완료!
            </h2>
            <p className="text-gray-600 mb-6">
              카카오 로그인이 성공적으로 완료되었습니다
            </p>
            <div className="space-y-4">
              <div className="text-sm text-gray-500">
                <span>페이지가 곧 이동됩니다...</span>
              </div>
              <Link
                href={state || "/"}
                className="inline-block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                지금 이동하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (authMutation.isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              로그인 실패
            </h2>
            <p className="text-gray-600 mb-6">
              로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/login/callback`;
                  authMutation.mutate({ code, redirectUri });
                }}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={authMutation.isPending}
              >
                다시 시도하기
              </button>
              <Link
                href="/login"
                className="inline-block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                로그인 페이지로 돌아가기
              </Link>
              <Link
                href="/"
                className="inline-block text-blue-600 hover:text-blue-800 text-sm"
              >
                홈으로 이동
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export const getServerSideProps = (
  context: GetServerSidePropsContext
): GetServerSidePropsResult<KakaoCallbackPageProps> => {
  const { code, state } = context.query;

  // Authorization code가 없는 경우
  if (!code) {
    return {
      redirect: {
        destination: "/500",
        permanent: false
      }
    };
  }

  return {
    props: {
      code: code as string,
      state: (state as string) || "/"
    }
  };
};
