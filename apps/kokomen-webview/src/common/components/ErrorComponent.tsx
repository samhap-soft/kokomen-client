import React from "react";
import errorImage from "@/assets/error.png";
import { Button } from "@kokomen/ui";
import { useCanGoBack, useRouter } from "@tanstack/react-router";

export default function ErrorComponent({
  cause,
  subText
}: {
  cause?: string;
  subText?: string;
}): React.ReactNode {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    <div className="h-screen">
      <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-800">
        <img src={errorImage} alt="로봇이 X표시판을 들고 있는 사진" />
        <h1 className="text-2xl font-bold mt-10">
          {cause ?? "서버에 오류가 발생했어요."}
        </h1>
        <p className="my-4">{subText ?? "잠시 후 다시 시도해 주세요."}</p>
        <Button
          variant={"gradient"}
          onClick={() => {
            if (canGoBack) {
              router.history.back();
            } else {
              router.navigate({ to: "/interviews", replace: true });
            }
          }}
          className="w-1/2 p-2 font-bold text-lg"
        >
          돌아가기
        </Button>
      </div>
    </div>
  );
}
