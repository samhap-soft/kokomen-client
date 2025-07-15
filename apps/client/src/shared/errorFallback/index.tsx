import { useRouter } from "next/router";
import { JSX } from "react";

interface ErrorFallbackProps {
  resetErrorBoundary?: () => void;
}

export default function ErrorFallback({
  resetErrorBoundary,
}: ErrorFallbackProps): JSX.Element {
  const router = useRouter();

  const handleRefresh = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/");
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center max-w-2xl px-8">
        {/* 에러 아이콘 */}
        <div className="mb-8">
          <div className="text-6xl">⚠️</div>
        </div>

        {/* 에러 제목 */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          오류가 발생했어요 🥲
        </h1>

        {/* 에러 설명 */}
        <p className="text-lg md:text-xl mb-6 text-gray-600 leading-relaxed">
          예상치 못한 문제가 발생했습니다. 페이지를 새로고침하거나 다시
          시도해주세요.
        </p>

        {/* 제안 사항 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <p className="text-gray-700 font-medium">
            페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-lg transition-colors duration-200 hover:bg-blue-700 min-w-[200px] justify-center"
          >
            <span>🏠</span>
            홈으로 돌아가기
          </button>

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
      </div>
    </div>
  );
}
