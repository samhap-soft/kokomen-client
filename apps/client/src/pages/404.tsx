import { SEO } from "@/shared/seo";
import { Button } from "@kokomen/ui";
import { Home, Search } from "lucide-react";
import Link from "next/link";
import { JSX } from "react";

export default function Custom404(): JSX.Element {
  return (
    <>
      <SEO title="404 Not Found" robots="noindex, nofollow, noarchive" />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center px-6 py-12 max-w-md">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-300 select-none">
              404
            </h1>
          </div>

          {/* 메인 메시지 */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              페이지를 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 leading-relaxed">
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            </p>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button
                variant="primary"
                size="default"
                className="w-full sm:w-auto font-bold"
              >
                <Home className="w-5 h-5" />
                홈으로 돌아가기
              </Button>
            </Link>

            <Button
              variant="default"
              size="default"
              className="w-full sm:w-auto font-bold"
              onClick={() => window.history.back()}
            >
              <Search className="w-5 h-5" />
              이전 페이지
            </Button>
          </div>

          {/* 추가 도움말 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              문제가 지속되면 관리자에게 문의해주세요.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
