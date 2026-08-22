import { JSX } from "react";
import { Button, Modal } from "@kokomen/ui";
import { useModal } from "@kokomen/utils";
import { useRouter } from "next/router";
import { Home } from "lucide-react";

export default function InterviewExitButton(): JSX.Element {
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useModal();

  /**
   * `router.back()`은 면접 링크로 바로 들어온 경우 사이트 밖으로 나가버린다.
   * 나갈 곳을 명시해서 항상 홈으로 보낸다.
   */
  const handleExit = (): void => {
    closeModal();
    router.push("/");
  };

  return (
    <>
      <Button
        variant={"default"}
        onClick={openModal}
        role="button"
        aria-label="면접 나가기"
        title="면접 나가기"
        className="fixed top-2 left-2 sm:top-3 sm:left-3 z-50"
      >
        <Home />
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title="면접 나가기"
        size={"md"}
        escToClose
        backdropClose
      >
        <div className="text-lg text-center p-4 mb-5">
          면접 중간에 나가시겠어요? <br /> 지금까지 제출한 답변은 저장되지만,
          <br /> 작성 중인 답변은 사라집니다.
        </div>
        <div className="flex gap-4">
          <Button
            type="button"
            role="button"
            aria-label="cancel-exit-button"
            onClick={closeModal}
            variant={"default"}
            size={"xl"}
            className="w-full"
          >
            아니오
          </Button>
          <Button
            type="button"
            role="button"
            aria-label="confirm-exit-button"
            onClick={handleExit}
            variant={"gradient"}
            size={"xl"}
            className="w-full"
          >
            네
          </Button>
        </div>
      </Modal>
    </>
  );
}
