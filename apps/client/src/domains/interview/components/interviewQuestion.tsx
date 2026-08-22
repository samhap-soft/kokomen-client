import { InterviewMode } from "@kokomen/types";
import { Button } from "@kokomen/ui";
import { Volume2 } from "lucide-react";
import { JSX } from "react";

const LIVE_CODING_BUBBLE_TEXT: string =
  "앞에 놓여진 문제를 보고 코드를 작성해주세요";

const WELCOME_TEXT: string =
  "꼬꼬면 면접에 오신걸 환영합니다. 준비가 되시면 버튼을 눌러 면접을 시작해주세요.";

// 질문 말풍선의 공통 레이아웃. 좁은 화면에서는 폭을 넓게, 글자를 작게 쓴다.
const BUBBLE_CLASS: string =
  "p-3 sm:p-4 absolute top-14 sm:top-20 left-[4%] w-[92%] sm:left-[10%] sm:w-[80%] " +
  "max-h-[120px] sm:max-h-[150px] text-center border flex items-center justify-center " +
  "z-20 border-border rounded-xl bg-bg-base";

const BUBBLE_INNER_CLASS: string =
  "overflow-y-auto w-full max-h-full text-base sm:text-xl flex justify-center text-center align-middle";

/**
 * 질문 영역.
 *
 * 질문이 바뀌면 스크린리더가 읽을 수 있도록 live region으로 감싼다.
 *
 * VOICE 모드는 서버가 음성 URL만 주고 질문 텍스트를 주지 않아서 자막을 만들 수 없다.
 * 대신 언제든 다시 들을 수 있는 버튼과 재생 상태 안내를 제공한다.
 * (완전한 자막은 응답에 질문 텍스트가 함께 오도록 서버 변경이 필요하다)
 */
export function InterviewQuestion({
  interviewMode,
  question,
  isInterviewStarted,
  playFinished,
  playAudio,
  isSpeaking = false,
  isLiveCoding = false
}: {
  interviewMode: InterviewMode;
  question: string;
  isInterviewStarted: boolean;
  playFinished: boolean;
  // eslint-disable-next-line no-unused-vars
  playAudio: (audioUrl?: string) => Promise<void>;
  isSpeaking?: boolean;
  isLiveCoding?: boolean;
}): JSX.Element | null {
  if (!isInterviewStarted) {
    return <QuestionBubble text={WELCOME_TEXT} />;
  }
  if (isLiveCoding) {
    return <QuestionBubble text={LIVE_CODING_BUBBLE_TEXT} />;
  }
  if (interviewMode === "VOICE") {
    return (
      <>
        <span aria-live="polite" role="status" className="sr-only">
          {isSpeaking
            ? "면접관이 질문을 읽고 있습니다."
            : playFinished
              ? "질문 재생이 끝났습니다. 답변해주세요."
              : ""}
        </span>
        {/* 재생이 끝난 뒤에만 보여주면 중간에 놓친 질문을 다시 들을 수 없다 */}
        <Button
          variant={"soft"}
          onClick={() => {
            playAudio().catch(() => {});
          }}
          disabled={isSpeaking}
          size={"large"}
          aria-label="질문 다시 듣기"
          className="absolute top-6 sm:top-10 w-[92%] sm:w-2/3 left-1/2 -translate-x-1/2 z-20 p-3 sm:p-4 font-bold flex items-center justify-center gap-2 motion-safe:animate-slide-up"
        >
          <Volume2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="text-sm sm:text-base">
            {isSpeaking ? "면접관이 질문하고 있어요" : "다시 말씀해주시겠어요?"}
          </span>
        </Button>
      </>
    );
  }
  return <QuestionBubble text={question} announce />;
}

function QuestionBubble({
  text,
  announce = false
}: {
  text: string;
  announce?: boolean;
}): JSX.Element {
  return (
    <div
      className={BUBBLE_CLASS}
      // 질문이 바뀌면 스크린리더가 새 질문을 읽어준다
      aria-live={announce ? "polite" : undefined}
      role={announce ? "status" : undefined}
    >
      <div className={BUBBLE_INNER_CLASS}>{text}</div>
    </div>
  );
}
