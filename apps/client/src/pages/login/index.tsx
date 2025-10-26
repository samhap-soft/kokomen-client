import { SEO } from "@/shared/seo";
import { clearSessionCookieSSR } from "@/utils/auth";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { JSX } from "react";

export default function LoginPage(): JSX.Element {
  const { query } = useRouter();
  const redirectTo = `&state=${query.redirectTo ? query.redirectTo : "/"}`;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/login/callback${redirectTo}`;
  const googleRedirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/login/google/callback${redirectTo}`;
  return (
    <>
      <SEO
        title="로그인"
        description="꼬꼬면 로그인"
        robots="index, nofollow"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* 로고 및 헤더 */}
          <div className="text-center">
            <div className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Image
                src="/apple-touch-icon.png"
                alt="꼬꼬면 로고"
                width={60}
                height={60}
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              꼬꼬면에 로그인
            </h2>
            <p className="text-gray-600">
              면접 연습을 시작하려면 로그인이 필요합니다
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <a
              href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao-login?redirectUri=${redirectUri}`}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl text-base font-medium text-black bg-[#FEE500] hover:bg-[#FFEB3B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <div className="flex items-center w-full">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <path
                    d="M12 3C6.48 3 2 6.24 2 10.32c0 2.52 1.68 4.8 4.32 6.12L5.52 20.4c-.12.36.36.6.6.36l3.84-2.64C10.56 18.24 11.28 18.36 12 18.36c5.52 0 10-3.24 10-7.32S17.52 3 12 3z"
                    fill="currentColor"
                  />
                </svg>
                <span className="flex-1 text-center">카카오로 시작하기</span>
              </div>
            </a>
            <a
              href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google-login?redirectUri=${googleRedirectUri}`}
              className="w-full flex items-center px-4 py-3 border border-[#747775] rounded-full"
            >
              <div className="flex items-center w-full">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-6 h-6"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span className="flex-1 text-center">구글로 시작하기</span>
              </div>
            </a>

            <div className="text-center space-y-4">
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  로그인 시 꼬꼬면의
                  <Link
                    target="_blank"
                    href="/terms/termsofuse"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    서비스 이용약관
                  </Link>
                  과
                  <Link
                    target="_blank"
                    href="/terms/privacy"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    개인정보 처리방침
                  </Link>
                  에 동의하게 됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 하단 정보 */}
        </div>
      </div>
    </>
  );
}

// 로그인 상태 확인 후 리다이렉트
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = context.req.cookies.JSESSIONID;

  if (session) {
    clearSessionCookieSSR(context);
  }

  return {
    props: {}
  };
};
