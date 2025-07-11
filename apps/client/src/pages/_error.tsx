// pages/_error.tsx
import { NextPageContext } from "next";
import * as Sentry from "@sentry/nextjs";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ErrorProps } from "next/error";
import { JSX } from "react";

interface CustomErrorProps extends ErrorProps {
  hasGetInitialProps: boolean;
}

function Error({ statusCode }: CustomErrorProps): JSX.Element {
  const router = useRouter();

  const getErrorInfo = (statusCode: number) => {
    switch (statusCode) {
      case 500:
        return {
          title: "서버 오류가 발생했습니다",
          description:
            "일시적인 서버 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
          emoji: "🔧",
          bgClasses: "bg-slate-50",
          suggestion: "페이지를 새로고침하거나 잠시 후 다시 접속해보세요.",
        };
      case 502:
        return {
          title: "게이트웨이 오류",
          description: "서버 간 통신에 문제가 발생했습니다.",
          emoji: "🌐",
          bgClasses: "bg-blue-50",
          suggestion: "네트워크 연결을 확인하고 다시 시도해주세요.",
        };
      case 503:
        return {
          title: "서비스를 이용할 수 없습니다",
          description:
            "현재 서비스 점검 중이거나 일시적으로 이용할 수 없습니다.",
          emoji: "🚧",
          bgClasses: "bg-amber-50",
          suggestion: "점검이 완료될 때까지 잠시만 기다려주세요.",
        };
      case 504:
        return {
          title: "게이트웨이 타임아웃",
          description: "서버 응답 시간이 초과되었습니다.",
          emoji: "⏱️",
          bgClasses: "bg-orange-50",
          suggestion: "잠시 후 다시 시도해주세요.",
        };
      default:
        return {
          title: "서버 오류가 발생했습니다",
          description: "예상치 못한 서버 문제가 발생했습니다.",
          emoji: "⚠️",
          bgClasses: "bg-gray-50",
          suggestion: "문제가 지속되면 고객센터로 문의해주세요.",
        };
    }
  };

  const errorInfo = getErrorInfo(statusCode || 500);

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
        className={`min-h-screen flex items-center justify-center ${errorInfo.bgClasses}`}
      >
        <div className="text-center max-w-2xl px-8">
          {/* 에러 아이콘 */}
          <div className="mb-8">
            <div className="text-6xl">{errorInfo.emoji}</div>
          </div>

          {/* 에러 코드 */}
          <div className="mb-6">
            <span className="text-8xl font-bold text-gray-800">
              {statusCode}
            </span>
          </div>

          {/* 에러 제목 */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            {errorInfo.title}
          </h1>

          {/* 에러 설명 */}
          <p className="text-lg md:text-xl mb-6 text-gray-600 leading-relaxed">
            {errorInfo.description}
          </p>

          {/* 제안 사항 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
            <p className="text-gray-700 font-medium">{errorInfo.suggestion}</p>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-lg transition-colors duration-200 hover:bg-blue-700 min-w-[200px] justify-center"
            >
              <span>🏠</span>
              홈으로 돌아가기
            </Link>

            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium text-lg transition-colors duration-200 hover:bg-gray-700 min-w-[200px] justify-center"
            >
              <span>⬅️</span>
              이전 페이지로
            </button>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium text-lg transition-colors duration-200 hover:bg-green-700 min-w-[200px] justify-center"
            >
              <span>🔄</span>
              새로고침
            </button>
          </div>

          {/* 추가 도움말 */}
          <details className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-left">
            <summary className="cursor-pointer font-medium text-center mb-2 text-gray-800 hover:text-gray-600">
              문제 해결 도움말
            </summary>
            <div className="mt-3">
              <ul className="space-y-2 text-sm md:text-base text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  브라우저 캐시를 지우고 다시 시도해보세요
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  다른 브라우저에서 접속해보세요
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  인터넷 연결 상태를 확인해보세요
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  VPN을 사용 중이라면 해제 후 시도해보세요
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </>
  );
}

Error.getInitialProps = async (contextData: NextPageContext) => {
  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  try {
    await Sentry.captureUnderscoreErrorException(contextData);
  } catch {
    console.error("CLIENT ERROR : SENTRY ERROR");
  }

  // This will contain the status code of the response
  const { res, err } = contextData;
  const statusCode = res ? res.statusCode : err ? err.statusCode : 500;

  return { statusCode };
};

export default Error;
