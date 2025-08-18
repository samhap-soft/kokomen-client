import { InterviewMode } from "@kokomen/types";
import { Button } from "@kokomen/ui";
import { JSX } from "react";

export default function InterviewQuestion({
  interviewMode,
  question,
  isInterviewStarted,
  playFinished,
  playAudio
}: {
  interviewMode: InterviewMode;
  question: string;
  isInterviewStarted: boolean;
  playFinished: boolean;
  // eslint-disable-next-line no-unused-vars
  playAudio: (audioUrl?: string) => Promise<void>;
}) {
  if (!isInterviewStarted) return <StartUpQuestion />;
  if (interviewMode === "VOICE") {
    if (playFinished) {
      return (
        <Button
          variant={"soft"}
          onClick={() => playAudio()}
          size={"large"}
          className="absolute top-10 w-2/3 left-1/2 -translate-x-1/2 z-20 p-4 font-bold animate-slide-up"
        >
          다시 말씀해주시겠어요?
        </Button>
      );
    }
    return null;
  }
  return (
    <div className="p-4 absolute top-20 left-[10%] w-[80%] h-36 text-center border flex items-center justify-center max-h-[150px] z-20 border-border rounded-xl bg-bg-base">
      <div className="overflow-y-auto w-full max-h-full text-xl flex justify-center text-center align-middle">
        {question}
      </div>
    </div>
  );
}

function StartUpQuestion(): JSX.Element {
  return (
    <div className="p-4 absolute top-20 left-[10%] w-[80%] h-36 text-center border flex items-center justify-center max-h-[150px] z-20 border-border rounded-xl bg-bg-base">
      <div className="overflow-y-auto w-full max-h-full text-xl flex justify-center text-center align-middle">
        꼬꼬면 면접에 오신걸 환영합니다. 준비가 되시면 버튼을 눌러 면접을
        시작해주세요.
      </div>
    </div>
  );
}
