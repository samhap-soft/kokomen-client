import { JSX } from "react";
import { Button, Modal } from "@kokomen/ui";
import { useModal } from "@kokomen/utils";
import { useRouter } from "next/router";
import { Home } from "lucide-react";

export default function InterviewExitButton(): JSX.Element {
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useModal();

  const handleExit = (): void => {
    closeModal();
    router.back();
  };

  return (
    <>
      <Button
        variant={"default"}
        onClick={openModal}
        role="button"
        aria-label="이전 페이지로 나가기"
        title="이전 페이지로 나가기"
        className="fixed top-3 left-3 z-50"
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
          면접 중간에 나가시겠어요? <br /> 현재까지 진행된 면접은 저장됩니다.
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
