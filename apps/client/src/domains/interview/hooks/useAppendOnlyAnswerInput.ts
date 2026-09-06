import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * 끝에 남은 한글 자모(낱자) 패턴.
 * 조합 자모(U+1100~), 호환 자모(U+3130~, 예: "ㄴ", "ㅏ"), 확장 자모를 모두 본다.
 * "나"에서 모음을 지우면 "ㄴ"만 남는 것처럼, 아직 글자로 완성되지 않은 꼬리는
 * 확정된 답변으로 보지 않는다.
 */
const TRAILING_JAMO_PATTERN: RegExp =
  /[ᄀ-ᇿ㄰-㆏ꥠ-꥿ힰ-퟿]+$/;

// 완성되지 않은 꼬리 자모를 제외한, 정말로 수정할 수 없는 접두사
function getImmutablePrefix(locked: string): string {
  return locked.replace(TRAILING_JAMO_PATTERN, "");
}

type UseAppendOnlyAnswerInputParams = {
  // "답변 수정 금지" 설정이 켜져 있는지 여부. 꺼져 있으면 자유롭게 수정할 수 있다.
  enabled: boolean;
  // 확정된 답변을 지우거나 고치려 할 때 호출(토스트 안내용)
  onBlockedEdit: () => void;
};

type UseAppendOnlyAnswerInput = {
  value: string;
  // eslint-disable-next-line no-unused-vars
  setValue: (next: string) => void;
  // eslint-disable-next-line no-unused-vars
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleCompositionStart: (
    // eslint-disable-next-line no-unused-vars
    e: React.CompositionEvent<HTMLTextAreaElement>
  ) => void;
  handleCompositionEnd: (
    // eslint-disable-next-line no-unused-vars
    e: React.CompositionEvent<HTMLTextAreaElement>
  ) => void;
  // eslint-disable-next-line no-unused-vars
  handleCut: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  // 삭제 키를 막았으면 true를 반환(호출부에서 이후 키 처리를 중단)
  // eslint-disable-next-line no-unused-vars
  guardDeletionKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => boolean;
};

/**
 * 한 번 확정한 답변은 지울 수 없는(append-only) 입력 상태를 관리한다.
 *
 * 한글은 IME 조합 과정에서 마지막 글자가 계속 바뀌기 때문에
 * (예: "ㄱ" → "가" → "각") 단순히 이전 값을 접두사로 요구하면 자음/모음 합성이 깨진다.
 * 그래서 "확정된 접두사(locked)"와 "조합 중인 글자"를 분리해서 관리하고,
 * 조합 중에는 마지막 글자의 변경·삭제를 허용한다.
 *
 * 또한 조합이 끊긴 채 남은 꼬리 자모(예: "나"에서 모음을 지워 남은 "ㄴ")는
 * 완성된 글자가 아니므로 잠그지 않는다. 그렇지 않으면 지울 수도 없는 낱자가
 * 답변 끝에 박혀버린다.
 *
 * enabled가 false면 잠금 없이 일반 textarea처럼 동작하고,
 * 면접 중에 true로 켜면 그 순간까지 입력한 내용부터 잠긴다.
 */
export function useAppendOnlyAnswerInput({
  enabled,
  onBlockedEdit
}: UseAppendOnlyAnswerInputParams): UseAppendOnlyAnswerInput {
  const [value, setValueState] = useState<string>("");
  // 확정되어 더 이상 수정할 수 없는 접두사
  const lockedRef = useRef<string>("");
  // IME 조합 중인지 여부
  const isComposingRef = useRef<boolean>(false);
  const valueRef = useRef<string>("");
  // 콜백을 다시 만들지 않고도 최신 설정값을 보기 위한 ref
  const isEnabledRef = useRef<boolean>(enabled);
  isEnabledRef.current = enabled;

  // 설정을 켠 순간까지 입력한 내용을 확정 처리한다
  useEffect(() => {
    if (enabled) {
      lockedRef.current = valueRef.current;
    }
  }, [enabled]);

  const commitValue = useCallback((next: string) => {
    valueRef.current = next;
    setValueState(next);
  }, []);

  // 음성 인식 결과 반영, 답변 제출 후 초기화 등 프로그램에서 값을 바꾸는 경로
  const setValue = useCallback(
    (next: string) => {
      isComposingRef.current = false;
      lockedRef.current = next;
      commitValue(next);
    },
    [commitValue]
  );

  // 안내 중복 노출은 호출부(onBlockedEdit)에서 기존 토스트를 닫고 다시 띄우는 방식으로 막는다
  const notifyBlockedEdit = onBlockedEdit;

  // 컨트롤드 입력에서 변경을 거부하면 React가 리렌더하지 않아 DOM 값이 남는다.
  // 직접 이전 값으로 되돌리고 커서를 끝으로 옮긴다.
  const restoreDom = useCallback((element: HTMLTextAreaElement) => {
    const restored = valueRef.current;
    element.value = restored;
    element.setSelectionRange(restored.length, restored.length);
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight > 400 ? 400 : element.scrollHeight}px`;
  }, []);

  const handleCompositionStart = useCallback(
    (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      isComposingRef.current = true;
      const current = e.currentTarget.value;
      // 브라우저가 이미 입력된 글자를 다시 조합 대상으로 잡는 경우
      // (e.data에 해당 글자가 담김) 그 글자는 잠금 대상에서 제외한다.
      const recomposing = e.data ?? "";
      lockedRef.current =
        recomposing.length > 0 && current.endsWith(recomposing)
          ? current.slice(0, current.length - recomposing.length)
          : current;
    },
    []
  );

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      isComposingRef.current = false;
      // 조합이 끝난 글자까지 확정
      lockedRef.current = e.currentTarget.value;
    },
    []
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      // 잠금이 꺼져 있으면 그대로 반영하되, 다시 켤 때 기준이 되도록 확정값은 갱신해둔다
      if (!isEnabledRef.current) {
        lockedRef.current = next;
        commitValue(next);
        return;
      }
      // 조합이 끊겨 꼬리에 남은 자모("나" → "ㄴ")는 아직 확정된 글자가 아니므로 지울 수 있다
      if (next.startsWith(getImmutablePrefix(lockedRef.current))) {
        // 조합 중이 아니면 입력한 내용이 바로 확정된다
        if (!isComposingRef.current) {
          lockedRef.current = next;
        }
        commitValue(next);
        return;
      }
      // 확정된 답변을 지우거나 중간을 고치려는 시도
      notifyBlockedEdit();
      restoreDom(e.target);
    },
    [commitValue, notifyBlockedEdit, restoreDom]
  );

  const guardDeletionKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): boolean => {
      if (!isEnabledRef.current) return false;
      // IME 조합 중에는 자모 단위 수정(백스페이스 포함)을 허용해야 한글 입력이 가능하다
      if (isComposingRef.current || e.nativeEvent.isComposing) return false;

      const key = e.key.toLowerCase();
      const isDeletion =
        e.key === "Backspace" ||
        e.key === "Delete" ||
        // 잘라내기 / 되돌리기·다시실행
        ((e.metaKey || e.ctrlKey) && (key === "x" || key === "z" || key === "y"));
      if (!isDeletion) return false;

      // 조합이 끊겨 꼬리에 남은 자모는 지울 수 있게 통과시킨다
      // (실제 삭제 결과는 handleChange에서 다시 검증한다)
      if (
        (e.key === "Backspace" || e.key === "Delete") &&
        valueRef.current.length > getImmutablePrefix(lockedRef.current).length
      ) {
        return false;
      }

      e.preventDefault();
      notifyBlockedEdit();
      return true;
    },
    [notifyBlockedEdit]
  );

  const handleCut = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!isEnabledRef.current) return;
      e.preventDefault();
      notifyBlockedEdit();
    },
    [notifyBlockedEdit]
  );

  return {
    value,
    setValue,
    handleChange,
    handleCompositionStart,
    handleCompositionEnd,
    handleCut,
    guardDeletionKeyDown
  };
}
