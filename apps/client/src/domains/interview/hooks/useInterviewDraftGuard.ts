import { useEffect } from "react";

/**
 * 작성 중인 답변이 있을 때 새로고침·탭 닫기를 막아 확인창을 띄운다.
 *
 * 페이지 내 이동(나가기 버튼)은 자체 확인 모달을 쓰기 때문에 여기서 다루지 않는다.
 * 이 훅은 브라우저가 직접 처리하는 이탈(새로고침, 탭 닫기, 주소 직접 입력)만 담당한다.
 */
export function useInterviewDraftGuard(hasUnsavedDraft: boolean): void {
  useEffect(() => {
    if (!hasUnsavedDraft) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      // 최신 브라우저는 커스텀 문구를 무시하고 기본 확인창만 띄운다.
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedDraft]);
}
