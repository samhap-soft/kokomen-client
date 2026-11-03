import {
  ProfileSetting,
  ProfileSettingType
} from "@/domains/auth/components/profilesettingForm";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
// @ts-expect-error : 선언 파일 없음
import { getRandomNickname } from "@woowa-babble/random-nickname";
import { UserInfo } from "@kokomen/types";
import { Modal, Button, Input } from "@kokomen/ui";
import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/domains/auth/api";
import { useToast } from "@kokomen/ui";
import { AxiosError } from "axios";

interface ChangeNicknameProps {
  userInfo: UserInfo;
}

export default function ChangeNickname({ userInfo }: ChangeNicknameProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [formData, setFormData] = useState<{ nickname: string } | null>(null);
  const router = useRouter();
  const { error: errorToast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ProfileSettingType>({
    resolver: standardSchemaResolver(ProfileSetting),
    defaultValues: { nickname: userInfo.nickname }
  });

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

  const handleFormSubmit = (data: ProfileSettingType): void => {
    setFormData(data);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (formData) {
      updateUserProfileMutation(formData.nickname);
    }
  };

  const handleRefresh = () => {
    router.reload();
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-text-primary">닉네임 변경</h2>

      <section className="flex flex-col gap-6 rounded-[20px] border border-border bg-bg-elevated p-6 md:p-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-text-secondary">현재 닉네임</p>
          <p className="text-xl font-semibold text-text-primary">
            {userInfo.nickname}
          </p>
        </div>
        <hr className="border-border" />
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-3"
        >
          <label
            htmlFor="nickname"
            className="text-base font-semibold text-text-primary"
          >
            새 닉네임
          </label>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
              id="nickname"
              type="text"
              size="lg"
              placeholder="닉네임을 입력해주세요"
              className="w-full md:w-[456px]"
              {...register("nickname")}
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                size="large"
                onClick={() =>
                  setValue("nickname", getRandomNickname("animals"), {
                    shouldValidate: true
                  })
                }
              >
                다시 생성
              </Button>
              <Button type="submit" size="large">
                저장하기
              </Button>
            </div>
          </div>
          {errors.nickname && (
            <p className="text-sm text-error">{errors.nickname.message}</p>
          )}
        </form>
      </section>

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
              variant="secondary"
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
            <Button onClick={handleRefresh}>새로고침</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
