import { createFileRoute, useSearch } from "@tanstack/react-router";
import React from "react";

// eslint-disable-next-line @rushstack/typedef-var
export const Route = createFileRoute("/login/")({
  component: RouteComponent
});

function RouteComponent(): React.ReactNode {
  const query = useSearch({
    from: "/login/",
    select: (search) => search as { redirectTo?: string }
  });
  const redirectTo = `&state=${query.redirectTo ?? "/"}`;
  const redirectUri = `${import.meta.env.VITE_BASE_URL}/login/callback${redirectTo}`;
  return (
    <>
      <div className="h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* 로고 및 헤더 */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">로그인</h2>
            <p className="text-gray-600">
              로그인하고 AI 모의 면접 서비스를 체험해보세요!
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <a
              href={`${import.meta.env.VITE_API_BASE_URL}/auth/kakao-login?redirectUri=${redirectUri}`}
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
                  로그인 시 꼬꼬면의{" "}
                  <a
                    href="/terms"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    서비스 이용약관
                  </a>
                  과{" "}
                  <a
                    href="/privacy"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    개인정보 처리방침
                  </a>
                  에 동의하게 됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 하단 정보 */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              처음 방문하시나요?{" "}
              <span className="text-blue-600 font-medium">
                카카오로 간편하게 가입하세요
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
