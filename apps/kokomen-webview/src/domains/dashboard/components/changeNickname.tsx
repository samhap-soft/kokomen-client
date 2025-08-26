import ProfileSettingForm from "@/domains/auth/components/profilesettingForm";
import { UserInfo } from "@kokomen/types";
import { Modal, Button } from "@kokomen/ui";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/domains/auth/api";
import { useToast } from "@kokomen/ui";
import { AxiosError } from "axios";
import { useRouter } from "@tanstack/react-router";

interface ChangeNicknameProps {
  userInfo: UserInfo;
}

export default function ChangeNickname({ userInfo }: ChangeNicknameProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [formData, setFormData] = useState<{ nickname: string } | null>(null);
  const { error: errorToast } = useToast();
  const router = useRouter();
  const { mutate: updateUserProfileMutation, isPending } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
    },
    onError: (error: AxiosError) => {
      errorToast({
        title: "닉네임 변경에 실패했습니다.",
        description:
          (error.response?.data as { message: string }).message ??
          "서버 오류가 발생했습니다."
      });
    }
  });

  const handleFormSubmit = (data: { nickname: string }) => {
    setFormData(data);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (formData) {
      updateUserProfileMutation(formData.nickname);
    }
  };

  const handleRefresh = () => {
    setIsSuccessModalOpen(false);
    router.navigate({ to: "/dashboard", reloadDocument: true });
  };

  return (
    <div className="flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">닉네임 변경</h1>
        <p className="text-gray-600">새로운 닉네임으로 변경할 수 있습니다</p>
      </div>

      <div className="w-full h-full flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-3/4 min-w-[300px]">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              현재 닉네임
            </h2>
            <p className="text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
              {userInfo.nickname}
            </p>
          </div>

          <ProfileSettingForm
            userInfo={userInfo}
            redirectTo="/dashboard"
            onFormSubmit={handleFormSubmit}
          />
        </div>
      </div>

      {/* 확인 모달 */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="닉네임 변경 확인"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            닉네임을{" "}
            <span className="font-semibold text-gray-900">
              {formData?.nickname}
            </span>
            으로 변경하시겠습니까?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="softWarning"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={isPending}>
              {isPending ? "변경 중..." : "확인"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 성공 모달 */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="닉네임 변경 완료"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">닉네임이 성공적으로 변경되었습니다.</p>
          <div className="flex gap-3 justify-end">
            <Button onClick={handleRefresh}>닫기</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
