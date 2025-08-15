import { Button, Layout } from "@kokomen/ui";
import { useRouter } from "next/router";
import { JSX } from "react";

export function InterviewNotFoundError(): JSX.Element {
  const router = useRouter();
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full mx-4">
          {/* 메인 카드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            {/* 아이콘 */}
            <span className="text-2xl mb-4">⚠️</span>

            {/* 제목 */}
            <h1 className="text-xl font-semibold text-slate-900 mb-3">
              면접을 불러올 수 없어요
            </h1>

            {/* 설명 */}
            <p className="text-slate-600 mb-8 leading-relaxed">
              면접 데이터를 가져오는 중 문제가 발생했습니다. <br />
              해당 면접이 본인의 면접이 맞는지 확인해주세요.
            </p>

            {/* 보조 액션 */}
            <div className="flex gap-3">
              <Button
                variant={"gradient"}
                onClick={() => router.back()}
                className="flex-1 py-2 px-4 transition-colors duration-200 text-sm font-bold text-text-light-solid"
              >
                이전 페이지
              </Button>
              <Button
                variant={"gradient"}
                onClick={() => router.push("/interviews")}
                className="flex-1 py-2 px-4 transition-colors duration-200 text-sm font-bold text-text-light-solid"
              >
                면접 페이지로 돌아가기
              </Button>
            </div>
          </div>

          {/* 도움말 */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-3">
              문제가 지속되나요?
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                브라우저를 새로고침해보세요
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                인터넷 연결을 확인해보세요
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                잠시 후 다시 시도해보세요
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
