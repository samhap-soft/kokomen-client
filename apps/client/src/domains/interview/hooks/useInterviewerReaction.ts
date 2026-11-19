import type { InterviewerEmotion } from "@kokomen/types";
import { Dispatch, SetStateAction, useCallback, useState } from "react";

/**
 * 면접관의 감정과 반응 신호를 함께 관리한다.
 *
 * 답변 등급이 나올 때마다 감정을 정하고 reactionKey 를 1 올린다. 같은 등급이 연달아 나와
 * 감정 값이 그대로여도, 영상 면접관은 reactionKey 가 바뀐 것을 보고 반응 클립을 다시 튼다.
 * 감정과 키를 같은 렌더에서 바꾸므로 반응은 항상 이번 답변의 감정으로 재생된다.
 */
export function useInterviewerReaction(): {
  emotion: InterviewerEmotion;
  reactionKey: number;
  setEmotion: Dispatch<SetStateAction<InterviewerEmotion>>;
} {
  const [state, setState] = useState<{
    emotion: InterviewerEmotion;
    reactionKey: number;
  }>({ emotion: "neutral", reactionKey: 0 });

  const setEmotion = useCallback<Dispatch<SetStateAction<InterviewerEmotion>>>(
    (next) => {
      setState((prev) => ({
        emotion: typeof next === "function" ? next(prev.emotion) : next,
        reactionKey: prev.reactionKey + 1
      }));
    },
    []
  );

  return { emotion: state.emotion, reactionKey: state.reactionKey, setEmotion };
}
