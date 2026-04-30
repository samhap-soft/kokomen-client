import { Button, Modal } from "@kokomen/ui";
import { startGuestInterview } from "@/domains/interview/api";
import { useRouter } from "next/router";
import { AlertTriangle, LogIn } from "lucide-react";
import { useState } from "react";
import useExtendedRouter from "@/hooks/useExtendedRouter";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestStart = async () => {
    setIsLoading(true);
    try {
      const { interview_id } = await startGuestInterview();
      router.push(`/interviews/${interview_id}?mode=TEXT`);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="데모 면접 안내"
      size="md"
      backdropClose
    >
      <div className="space-y-6">
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
            disabled={isLoading}
            onClick={handleGuestStart}
          >
            {isLoading ? "면접 생성 중..." : "이해했어요"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
