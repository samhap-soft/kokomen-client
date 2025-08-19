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
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Image src="/icon.png" alt="꼬꼬면 로고" width={60} height={60} />
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
              <div className="flex items-center space-x-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3C6.48 3 2 6.24 2 10.32c0 2.52 1.68 4.8 4.32 6.12L5.52 20.4c-.12.36.36.6.6.36l3.84-2.64C10.56 18.24 11.28 18.36 12 18.36c5.52 0 10-3.24 10-7.32S17.52 3 12 3z"
                    fill="currentColor"
                  />
                </svg>
                <span>카카오로 시작하기</span>
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
