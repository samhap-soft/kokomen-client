import { Button } from "@kokomen/ui/components/button";

export default function Custom500() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-3">서버가 아파요🤧</h1>
        <p className="mt-4 text-lg text-gray-700">
          서버에 문제가 발생했습니다.
        </p>
        <p className="mt-2 text-sm text-gray-500">잠시 후 다시 시도해주세요.</p>
        <Button
          variant="primary"
          className="mt-4 w-full"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
}
