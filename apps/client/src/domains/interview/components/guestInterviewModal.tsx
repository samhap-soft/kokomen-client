import { Button, Modal } from "@kokomen/ui";
import { startGuestInterview } from "@/domains/interview/api";
import { useRouter } from "next/router";
import { AlertTriangle, LogIn } from "lucide-react";
import useExtendedRouter from "@/hooks/useExtendedRouter";
import { useMutation } from "@tanstack/react-query";

interface GuestInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuestInterviewModal({
  isOpen,
  onClose
}: GuestInterviewModalProps) {
  const router = useRouter();
  const extendedRouter = useExtendedRouter();
  const {
    isPending,
    mutate: startGuestInterviewMutation,
    error,
    isError,
    reset
  } = useMutation({
    mutationFn: startGuestInterview,
    onSuccess: (data) => {
      router.push(`/interviews/${data.interview_id}?mode=TEXT`);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="데모 면접 안내"
      size="md"
      backdropClose
    >
      <div className="space-y-6">
        {isError ? (
          <>
            <div className="flex items-center justify-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-lg text-amber-900 font-medium">
                {error?.message}
              </p>
            </div>
            <Button
              variant="softWarning"
              size="large"
              className="w-full font-semibold"
              onClick={handleClose}
            >
              돌아가기
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-lg text-amber-900 font-medium">
                비회원 시 면접 기능은 1회밖에 사용할 수 없어요
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="soft"
                size="large"
                className="flex-1 font-semibold"
                onClick={() => extendedRouter.navigateToLogin()}
              >
                <LogIn className="w-4 h-4 mr-2" />
                로그인하고 진행
              </Button>
              <Button
                variant="primary"
                size="large"
                className="flex-1 font-semibold"
                disabled={isPending}
                onClick={() => startGuestInterviewMutation()}
              >
                {isPending ? "면접 생성 중..." : "이해했어요"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
