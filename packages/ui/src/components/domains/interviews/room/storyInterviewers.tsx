import type { InterviewerEmotion } from "@kokomen/types";
import { JSX, ReactNode, useState } from "react";
import { cn } from "../../../../utils";
import { InterviewerClip, InterviewerVideo } from "./interviewerVideo";
import { InterviewerPickerOption } from "./interviewerPicker";
import { VideoTile } from "./videoTile";

/**
 * 스토리 전용 면접관 데이터와 조작 패널.
 *
 * 실제 목록은 apps/client/src/domains/interview/interviewers.ts 에 있다. Storybook 은 앱 public 의
 * /interviewer 폴더를 그대로 서빙하므로(.storybook/main.js staticDirs) 같은 영상을 쓴다.
 * 이 파일은 스토리에서만 import 한다.
 */
export const STORY_INTERVIEWERS: InterviewerPickerOption[] = [
  {
    id: "default",
    name: "개발자 면접관"
  },
  {
    id: "senior",
    name: "시니어 테크 리드"
  },
  {
    id: "manager",
    name: "엔지니어링 매니저"
  },
  {
    id: "executive",
    name: "임원 면접관"
  }
].map((interviewer) => ({
  ...interviewer,
  posterUrl: `/interviewer/${interviewer.id}/poster.jpg`
}));

const clipUrlsOf = (id: string): Record<InterviewerClip, string> => ({
  idle: `/interviewer/${id}/idle.mp4`,
  speaking: `/interviewer/${id}/speaking.mp4`,
  positive: `/interviewer/${id}/positive.mp4`,
  thinking: `/interviewer/${id}/thinking.mp4`
});

export type StoryInterviewerState = {
  interviewerId: string;
  setInterviewerId: (id: string) => void;
  emotion: InterviewerEmotion;
  reactionKey: number;
  isSpeaking: boolean;
  setIsSpeaking: (value: boolean) => void;
  react: (emotion: InterviewerEmotion) => void;
};

export function useStoryInterviewer(
  initialId: string = "default"
): StoryInterviewerState {
  const [interviewerId, setInterviewerId] = useState<string>(initialId);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [reaction, setReaction] = useState<{
    emotion: InterviewerEmotion;
    key: number;
  }>({ emotion: "neutral", key: 0 });

  return {
    interviewerId,
    setInterviewerId,
    emotion: reaction.emotion,
    reactionKey: reaction.key,
    isSpeaking,
    setIsSpeaking,
    react: (emotion) =>
      setReaction((prev) => ({ emotion, key: prev.key + 1 }))
  };
}

/** 면접실 타일 자리에 넣는 실제 영상 면접관 */
export function StoryInterviewerTile({
  state
}: {
  state: StoryInterviewerState;
}): JSX.Element {
  return (
    <VideoTile label="AI 면접관" isActive={state.isSpeaking}>
      <InterviewerVideo
        interviewerId={state.interviewerId}
        clipUrls={clipUrlsOf(state.interviewerId)}
        posterUrl={`/interviewer/${state.interviewerId}/poster.jpg`}
        emotion={state.emotion}
        reactionKey={state.reactionKey}
        isSpeaking={state.isSpeaking}
      />
    </VideoTile>
  );
}

function PanelButton({
  children,
  onClick,
  isActive = false
}: {
  children: ReactNode;
  onClick: () => void;
  isActive?: boolean;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap",
        isActive
          ? "border-primary bg-primary-bg-light text-primary-text"
          : "border-border bg-bg-base text-text-primary hover:bg-fill-tertiary"
      )}
    >
      {children}
    </button>
  );
}

/**
 * 스토리 화면 위 가운데에 떠 있는 조작 패널(접을 수 있다). 면접관을 바꾸고, 말하기 · 반응을 직접 틀어 본다.
 * 실제 화면에서는 질문 음성 재생 여부와 답변 등급이 이 역할을 한다.
 */
export function StoryInterviewerPanel({
  state
}: {
  state: StoryInterviewerState;
}): JSX.Element {
  // 조작 바 버튼을 가릴 수 있어서 접을 수 있게 한다
  const [isOpen, setIsOpen] = useState<boolean>(true);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed top-3 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-border bg-bg-base/95 px-3 py-1.5 text-xs font-semibold text-text-secondary shadow-lg"
      >
        스토리 조작 열기
      </button>
    );
  }

  return (
    <div className="fixed top-3 left-1/2 z-[60] flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 flex-col gap-2 rounded-xl border border-border bg-bg-base/95 p-2.5 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold text-text-tertiary">
          스토리 조작 · 면접관 영상
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-[11px] font-semibold text-text-tertiary hover:text-text-primary"
        >
          접기
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {STORY_INTERVIEWERS.map((interviewer) => (
          <PanelButton
            key={interviewer.id}
            isActive={state.interviewerId === interviewer.id}
            onClick={() => state.setInterviewerId(interviewer.id)}
          >
            {interviewer.name}
          </PanelButton>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        <PanelButton
          isActive={state.isSpeaking}
          onClick={() => state.setIsSpeaking(!state.isSpeaking)}
        >
          {state.isSpeaking ? "질문 끝내기" : "질문 읽기(말하기)"}
        </PanelButton>
        <PanelButton onClick={() => state.react("happy")}>
          좋은 답변(A·B) → 칭찬
        </PanelButton>
        <PanelButton onClick={() => state.react("angry")}>
          아쉬운 답변(D·F) → 아쉬움
        </PanelButton>
      </div>
    </div>
  );
}
