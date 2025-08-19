import { useState } from "react";
import { Button, Modal, useToast } from "@kokomen/ui";
import { AlertTriangle, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { deleteUser } from "@/domains/auth/api";
import { useRouter } from "next/router";
import { AxiosError } from "axios";

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
    <div className="flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">회원 탈퇴</h1>
        <p className="text-gray-600">계정을 영구적으로 삭제할 수 있습니다</p>
      </div>

      <div className="w-full h-full flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl w-3/4 min-w-[300px]">
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 mb-2">주의사항</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>
                    • 회원 탈퇴 시 개인정보는 삭제되지만, 면접 기록은 삭제되지
                    않습니다
                  </li>
                  <li>• 점수, 랭킹 등 개인 정보가 모두 삭제됩니다</li>
                  <li>• 탈퇴 후에는 복구가 불가능합니다</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                탈퇴 전 확인사항
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>
                    개인정보는 삭제되지만, 면접 기록은 삭제되지 않습니다
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>누적 점수와 랭킹이 초기화됩니다</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>다른 사용자에게 공개된 면접 결과도 삭제됩니다</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleWithdrawalClick}
              variant="warning"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              회원 탈퇴 진행
            </Button>
          </div>
        </div>
      </div>

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
              variant="outline"
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleConfirmWithdraw}
              variant="warning"
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
