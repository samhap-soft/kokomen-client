import { useState } from "react";
import { Button, Modal, useToast } from "@kokomen/ui";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { deleteUser } from "@/domains/auth/api";
import { useRouter } from "next/router";
import { AxiosError } from "axios";

const WITHDRAWAL_NOTICES: readonly string[] = [
  "개인정보는 삭제되지만, 면접 기록은 삭제되지 않습니다.",
  "누적 점수와 랭킹 정보는 삭제됩니다.",
  "다른 사용자에게 공개된 면접 결과는 삭제됩니다.",
  "탈퇴한 계정은 복구할 수 없습니다."
];

export default function Withdrawal() {
  const [confirmText, setConfirmText] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const router = useRouter();

  const { error: errorToast } = useToast();

  const { mutate: deleteUserMutation } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      setIsLoadingModalOpen(false);
      setIsSuccessModalOpen(true);
    },
    onError: (error: AxiosError) => {
      setIsLoadingModalOpen(false);
      if (error.response?.status === 400) {
        const data = error.response?.data as { message?: string };
        errorToast({
          title: "회원 탈퇴에 실패했습니다.",
          description: data?.message ?? "서버 오류가 발생했습니다."
        });
      }
    }
  });

  const isConfirmTextValid = confirmText === "탈퇴하겠습니다";

  const handleWithdrawalClick = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmWithdraw = () => {
    if (!isConfirmTextValid) return;

    setIsConfirmModalOpen(false);
    setIsLoadingModalOpen(true);
    deleteUserMutation();
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setConfirmText("");
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    router.replace("/");
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-text-primary">회원 탈퇴</h2>

      <section className="flex flex-col gap-6 rounded-[20px] border border-border bg-bg-elevated p-6 md:p-8">
        <p className="text-xs font-medium text-error-text">
          탈퇴 후에는 복구할 수 없어요
        </p>
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-semibold text-text-primary">
            꼭 확인해 주세요
          </h3>
          <ul className="text-lg text-text-secondary">
            {WITHDRAWAL_NOTICES.map((notice) => (
              <li key={notice}>• {notice}</li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            size="large"
            variant="none"
            className="rounded-xl bg-error-bg text-text-primary hover:bg-error-bg-hover"
            onClick={handleWithdrawalClick}
          >
            회원 탈퇴 진행
          </Button>
          <Button
            size="large"
            variant="secondary"
            onClick={() => router.push("/dashboard")}
          >
            돌아가기
          </Button>
        </div>
      </section>

      {/* 탈퇴 확인 모달 */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        title="회원 탈퇴 확인"
        size="lg"
        escToClose={false}
        backdropClose={false}
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              정말 탈퇴하시겠습니까?
            </h3>
            <p className="text-gray-600 mb-6">
              이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
            </p>
          </div>

          <div className="space-y-4">
            <label
              htmlFor="confirmText"
              className="block text-sm font-medium text-gray-700"
            >
              확인을 위해 아래 텍스트를 정확히 입력해주세요
            </label>
            <input
              id="confirmText"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="탈퇴하겠습니다"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className="text-sm text-gray-500">
              정확히 &quot;탈퇴하겠습니다&quot;를 입력해주세요
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCloseConfirmModal}
              variant="secondary"
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleConfirmWithdraw}
              variant="danger"
              className="flex-1"
              disabled={!isConfirmTextValid}
            >
              탈퇴 확인
            </Button>
          </div>
        </div>
      </Modal>

      {/* 로딩 모달 */}
      <Modal
        isOpen={isLoadingModalOpen}
        onClose={() => {}}
        title="회원 탈퇴 처리 중"
        size="md"
        escToClose={false}
        backdropClose={false}
        closeButton={false}
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              회원 탈퇴를 처리하고 있습니다
            </h3>
            <p className="text-gray-600">
              잠시만 기다려주세요. 모든 데이터를 안전하게 삭제하고 있습니다.
            </p>
          </div>
        </div>
      </Modal>

      {/* 탈퇴 완료 모달 */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        title="회원 탈퇴 완료"
        size="md"
        escToClose={false}
        backdropClose={false}
        closeButton={false}
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              회원 탈퇴가 완료되었습니다
            </h3>
            <p className="text-gray-600 mb-6">
              모든 데이터가 성공적으로 삭제되었습니다. 이용해주셔서
              감사했습니다.
            </p>
          </div>
          <Button onClick={handleCloseSuccessModal} className="w-full">
            확인
          </Button>
        </div>
      </Modal>
    </div>
  );
}
