import { useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "kokomen:interview-draft:";
const SAVE_DELAY_MS = 600;

/**
 * 면접 하나에 초안 하나를 둔다. progressKey 는 "지금 어느 질문에 답하고 있는지"이다.
 * 예: 기본 면접은 질문 id, 시스템 설계는 `${stage}:${questionId}`.
 *
 * 다른 질문으로 넘어가면 이전 질문의 초안은 의미가 없으므로 덮어쓴다.
 * 새로고침 · 탭 복구 때 같은 질문이면 초안을 되살린다.
 */
type StoredDraft<T> = {
  progressKey: string;
  value: T;
  savedAt: number;
};

const getStorageKey = (interviewId: number | string): string =>
  `${STORAGE_PREFIX}${interviewId}`;

export const readAnswerDraft = <T>(
  interviewId: number | string,
  progressKey: string
): T | null => {
  try {
    const raw = window.localStorage.getItem(getStorageKey(interviewId));
    if (!raw) return null;
    const draft = JSON.parse(raw) as StoredDraft<T>;
    return draft.progressKey === progressKey ? draft.value : null;
  } catch {
    return null;
  }
};

export const writeAnswerDraft = <T>(
  interviewId: number | string,
  progressKey: string,
  value: T
): boolean => {
  try {
    const draft: StoredDraft<T> = { progressKey, value, savedAt: Date.now() };
    window.localStorage.setItem(
      getStorageKey(interviewId),
      JSON.stringify(draft)
    );
    return true;
  } catch {
    // 저장 공간이 없거나 막혀 있으면 이번에는 저장하지 않는다
    return false;
  }
};

export const clearAnswerDraft = (interviewId: number | string): void => {
  try {
    window.localStorage.removeItem(getStorageKey(interviewId));
  } catch {
    // localStorage 를 쓸 수 없으면 지울 것도 없다
  }
};

type UseAnswerDraftOptions<T> = {
  interviewId: number | string;
  progressKey: string;
  value: T;
  /** 비어 있으면 저장하지 않는다(빈 초안으로 덮어쓰지 않도록) */
  isEmpty: boolean;
  /** 면접이 끝났거나 시작 전이면 false */
  enabled: boolean;
};

/**
 * 값이 바뀌고 잠시 멈추면 초안을 저장하고 "초안 자동 저장됨" 상태를 돌려준다.
 * 되살릴 값은 readAnswerDraft 로 직접 읽는다(입력 상태의 주인이 호출부라서).
 */
export function useAnswerDraft<T>({
  interviewId,
  progressKey,
  value,
  isEmpty,
  enabled
}: UseAnswerDraftOptions<T>): { isSaved: boolean } {
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serialized = JSON.stringify(value);

  useEffect(() => {
    if (!enabled || isEmpty) return;
    timerRef.current = setTimeout(() => {
      if (writeAnswerDraft(interviewId, progressKey, JSON.parse(serialized))) {
        setSavedKey(`${progressKey}|${serialized}`);
      }
    }, SAVE_DELAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, isEmpty, interviewId, progressKey, serialized]);

  return {
    isSaved: enabled && !isEmpty && savedKey === `${progressKey}|${serialized}`
  };
}
