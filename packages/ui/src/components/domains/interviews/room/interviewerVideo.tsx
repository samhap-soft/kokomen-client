import type { InterviewerEmotion } from "@kokomen/types";
import { JSX, useEffect, useRef, useState } from "react";

export type InterviewerClip = "idle" | "speaking" | "positive" | "thinking";

const CLIPS: readonly InterviewerClip[] = [
  "idle",
  "speaking",
  "positive",
  "thinking"
];

/** 반응 클립(한 번만 재생)을 고르는 기준. 답변 등급으로 정해지는 감정을 쓴다. */
const REACTION_BY_EMOTION: Partial<Record<InterviewerEmotion, InterviewerClip>> =
  {
    happy: "positive",
    encouraging: "positive",
    angry: "thinking"
  };

export interface InterviewerVideoProps {
  /** 면접관이 바뀌면 영상을 새로 불러오도록 key 로도 쓴다 */
  interviewerId: string;
  clipUrls: Record<InterviewerClip, string>;
  posterUrl: string;
  emotion: InterviewerEmotion;
  /**
   * 답변을 제출할 때마다 바뀌는 값.
   * 같은 등급이 연달아 나와 감정 값이 그대로여도 반응 클립을 다시 틀기 위해 쓴다.
   */
  reactionKey: number;
  isSpeaking: boolean;
  onError?: () => void;
}

/**
 * 실사 면접관 영상. 상태에 따라 클립을 바꿔 튼다.
 *
 * - 질문 음성이 나오는 동안: speaking 반복
 * - 답변 등급이 나오면: positive / thinking 을 한 번 재생한 뒤 원래 클립으로 돌아간다
 * - 그 밖에는 idle 반복
 *
 * 네 클립을 겹쳐 미리 불러 두고 보이는 것만 바꾼다. 클립은 모두 같은 장면에서 시작하고 끝나서
 * 전환할 때 이음매가 보이지 않는다. 하나라도 재생에 실패하면 onError 로 알린다.
 */
export function InterviewerVideo({
  interviewerId,
  clipUrls,
  posterUrl,
  emotion,
  reactionKey,
  isSpeaking,
  onError
}: InterviewerVideoProps): JSX.Element {
  const videoRefs = useRef<Partial<Record<InterviewerClip, HTMLVideoElement>>>(
    {}
  );
  const [reaction, setReaction] = useState<InterviewerClip | null>(null);

  // 답변이 제출될 때마다 그때의 감정으로 반응 클립을 한 번 튼다. 처음 마운트할 때는 반응하지 않는다.
  const lastReactionKeyRef = useRef<number>(reactionKey);
  useEffect(() => {
    if (lastReactionKeyRef.current === reactionKey) return;
    lastReactionKeyRef.current = reactionKey;
    setReaction(REACTION_BY_EMOTION[emotion] ?? null);
  }, [reactionKey, emotion]);

  // 질문이 나오기 시작하면 반응보다 말하기를 먼저 보여준다
  const active: InterviewerClip = isSpeaking
    ? "speaking"
    : (reaction ?? "idle");

  useEffect(() => {
    for (const clip of CLIPS) {
      const video = videoRefs.current[clip];
      if (!video) continue;
      if (clip === active) {
        // 반응 클립은 처음부터 한 번, 반복 클립은 이어서 재생한다
        if (clip === "positive" || clip === "thinking") video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [active, interviewerId]);

  return (
    <div className="relative h-full w-full bg-gray-9">
      {CLIPS.map((clip) => {
        const isReaction = clip === "positive" || clip === "thinking";
        return (
          <video
            key={`${interviewerId}-${clip}`}
            ref={(element) => {
              if (element) videoRefs.current[clip] = element;
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
              clip === active ? "opacity-100" : "opacity-0"
            }`}
            src={clipUrls[clip]}
            poster={posterUrl}
            preload="auto"
            loop={!isReaction}
            autoPlay={clip === "idle"}
            muted
            playsInline
            aria-hidden={clip !== active}
            aria-label={clip === active ? "AI 면접관 화면" : undefined}
            onEnded={isReaction ? () => setReaction(null) : undefined}
            onError={onError}
          />
        );
      })}
    </div>
  );
}
