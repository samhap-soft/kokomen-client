import React from "react";
import errorImage from "@/assets/error.png";
import { Button } from "@kokomen/ui/components/button";

export default function ErrorComponent(): React.ReactNode {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-800">
      <img src={errorImage} alt="로봇이 X표시판을 들고 있는 사진" />
      <h1 className="text-2xl font-bold mt-10">서버에 오류가 발생했어요.</h1>
      <p className="my-4">잠시 후 다시 시도해 주세요.</p>
      <Button
        variant={"gradient"}
        onClick={() => {
          location.href = "/interviews";
        }}
        className="w-1/2 p-2 font-bold text-lg"
      >
        새로고침
      </Button>
    </div>
  );
}
