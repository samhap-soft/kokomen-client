import { JSX } from "react";
import { Button, Modal } from "@kokomen/ui";
import { useRouter } from "next/router";

/**
 * "면접 중도 종료" 확인 dialog. 면접실 조작 바의 버튼이 연다.
 * (예전에는 화면 왼쪽 위 홈 아이콘 버튼이 열었다)
 */
export function InterviewExitModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}): JSX.Element {
  const router = useRouter();

  /**
   * `router.back()`은 면접 링크로 바로 들어온 경우 사이트 밖으로 나가버린다.
   * 나갈 곳을 명시해서 항상 홈으로 보낸다.
   */
  const handleExit = (): void => {
    onClose();
    router.push("/");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="면접 중도 종료"
      size={"md"}
      escToClose
      backdropClose
    >
      <div className="mb-5 p-4 text-center text-lg">
        면접을 그만두고 나가시겠어요? <br /> 지금까지 제출한 답변은 저장되고,
        <br /> 작성 중인 답변은 초안으로 남아 있어요.
      </div>
      <div className="flex gap-4">
        <Button
          type="button"
          aria-label="cancel-exit-button"
          onClick={onClose}
          variant={"secondary"}
          size={"xl"}
          className="w-full"
        >
          계속하기
        </Button>
        <Button
          type="button"
          aria-label="confirm-exit-button"
          onClick={handleExit}
          variant={"primary"}
          size={"xl"}
          className="w-full"
        >
          나가기
        </Button>
      </div>
    </Modal>
  );
}
