// pages/_error.tsx
import { NextPageContext } from "next";
import * as Sentry from "@sentry/nextjs";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ErrorProps } from "next/error";
import { JSX, useEffect, useState } from "react";

interface CustomErrorProps extends ErrorProps {
  hasGetInitialProps: boolean;
}

function Error({ statusCode }: CustomErrorProps): JSX.Element {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  const getErrorInfo = (statusCode: number) => {
    switch (statusCode) {
      case 500:
        return {
          title: "서버 오류가 발생했습니다",
          description:
            "일시적인 서버 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
          emoji: "🔧",
          bgClasses: "bg-gradient-to-br from-red-500 to-red-700",
          suggestion: "페이지를 새로고침하거나 잠시 후 다시 접속해보세요.",
        };
      case 502:
        return {
          title: "게이트웨이 오류",
          description: "서버 간 통신에 문제가 발생했습니다.",
          emoji: "🌐",
          bgClasses: "bg-gradient-to-br from-purple-500 to-purple-700",
          suggestion: "네트워크 연결을 확인하고 다시 시도해주세요.",
        };
      case 503:
        return {
          title: "서비스를 이용할 수 없습니다",
          description:
            "현재 서비스 점검 중이거나 일시적으로 이용할 수 없습니다.",
          emoji: "🚧",
          bgClasses: "bg-gradient-to-br from-orange-500 to-orange-700",
          suggestion: "점검이 완료될 때까지 잠시만 기다려주세요.",
        };
      case 504:
        return {
          title: "게이트웨이 타임아웃",
          description: "서버 응답 시간이 초과되었습니다.",
          emoji: "⏱️",
          bgClasses: "bg-gradient-to-br from-yellow-500 to-yellow-700",
          suggestion: "잠시 후 다시 시도해주세요.",
        };
      default:
        return {
          title: "서버 오류가 발생했습니다",
          description: "예상치 못한 서버 문제가 발생했습니다.",
          emoji: "⚠️",
          bgClasses: "bg-gradient-to-br from-gray-500 to-gray-700",
          suggestion: "문제가 지속되면 고객센터로 문의해주세요.",
        };
    }
  };

  const errorInfo = getErrorInfo(statusCode || 500);

  // 자동 홈 리다이렉션 카운트다운
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <Head>
        <title>
          {statusCode} - {errorInfo.title}
        </title>
        <meta name="robots" content="noindex" />
      </Head>

      <div
        className={`min-h-screen flex items-center justify-center text-white font-sans relative overflow-hidden ${errorInfo.bgClasses}`}
      >
        <div className="text-center max-w-2xl px-8 z-10 relative">
          {/* 에러 아이콘과 애니메이션 */}
          <div className="mb-8">
            <div className="text-8xl animate-bounce inline-block">
              {errorInfo.emoji}
            </div>
          </div>

          {/* 에러 코드 */}
          <div className="mb-6">
            <span className="text-9xl font-black leading-none bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent drop-shadow-lg">
              {statusCode}
            </span>
          </div>

          {/* 에러 제목 */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">
            {errorInfo.title}
          </h1>

          {/* 에러 설명 */}
          <p className="text-xl md:text-2xl mb-6 opacity-95 leading-relaxed">
            {errorInfo.description}
          </p>

          {/* 제안 사항 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
            <p className="text-lg font-medium">{errorInfo.suggestion}</p>
          </div>

          {/* 자동 리다이렉션 카운트다운 */}
          {countdown > 0 && (
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 mb-8 border border-white/10">
              <p className="text-lg font-semibold">
                {countdown}초 후 홈페이지로 이동합니다...
              </p>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-gray-100 hover:-translate-y-1 hover:shadow-xl min-w-[200px] justify-center"
            >
              <span>🏠</span>
              홈으로 돌아가기
            </Link>

            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/30 transition-all duration-300 hover:bg-white/30 hover:-translate-y-1 hover:shadow-xl min-w-[200px] justify-center"
            >
              <span>⬅️</span>
              이전 페이지로
            </button>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/30 transition-all duration-300 hover:bg-white/30 hover:-translate-y-1 hover:shadow-xl min-w-[200px] justify-center"
            >
              <span>🔄</span>
              새로고침
            </button>
          </div>

          {/* 추가 도움말 */}
          <details className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-left">
            <summary className="cursor-pointer font-semibold text-center mb-2 hover:text-white/80">
              문제 해결 도움말
            </summary>
            <div className="mt-3">
              <ul className="space-y-2 text-sm md:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-white/70">•</span>
                  브라우저 캐시를 지우고 다시 시도해보세요
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/70">•</span>
                  다른 브라우저에서 접속해보세요
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/70">•</span>
                  인터넷 연결 상태를 확인해보세요
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/70">•</span>
                  VPN을 사용 중이라면 해제 후 시도해보세요
                </li>
              </ul>
            </div>
          </details>
        </div>

        {/* 배경 애니메이션 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-white/5 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/4 left-1/5 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
        </div>

        {/* 추가 플로팅 애니메이션 */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-ping"></div>
        <div className="absolute top-20 right-20 w-6 h-6 bg-white/15 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-white/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-10 left-20 w-3 h-3 bg-white/25 rounded-full animate-ping"></div>
      </div>
    </>
  );
}

Error.getInitialProps = async (contextData: NextPageContext) => {
  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  await Sentry.captureUnderscoreErrorException(contextData);

  // This will contain the status code of the response
  const { res, err } = contextData;
  const statusCode = res ? res.statusCode : err ? err.statusCode : 500;

  return { statusCode };
};

export default Error;
