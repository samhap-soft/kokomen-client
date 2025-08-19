import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useToast } from "@kokomen/ui";
import { AxiosError } from "axios";
import { updateUserProfile } from "@/domains/auth/api";
import { Input } from "@kokomen/ui";
import { Button } from "@kokomen/ui";
import { captureFormSubmitEvent } from "@/utils/analytics";
import { User } from "@kokomen/types";
import z from "zod";
import { RotateCcw } from "lucide-react";
// @ts-expect-error : 선언 파일 없음
import { getRandomNickname } from "@woowa-babble/random-nickname";

// eslint-disable-next-line @rushstack/typedef-var
const ProfileSetting = z.object({
  nickname: z
    .string()
    .min(2, { message: "닉네임은 2자 이상이어야 합니다." })
    .max(20, { message: "닉네임은 20자 이하이어야 합니다." })
    .regex(/^[가-힣a-zA-Z0-9\s]+$/, {
      message: "닉네임은 한글 조합, 영문, 숫자, 띄어쓰기만 사용할 수 있습니다."
    })
});
type ProfileSettingType = z.infer<typeof ProfileSetting>;

export default function ProfileSettingForm({
  userInfo,
  redirectTo,
  onSuccess,
  onFormSubmit
}: {
  userInfo: User;
  redirectTo: string;
  onSuccess?: () => void;
  // eslint-disable-next-line no-unused-vars
  onFormSubmit?: (data: ProfileSettingType) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<ProfileSettingType>({
    resolver: standardSchemaResolver(ProfileSetting),
    defaultValues: {
      nickname: userInfo.profile_completed
        ? userInfo.nickname
        : getRandomNickname("animals")
    }
  });
  const router = useRouter();
  const { error: errorToast } = useToast();
  const {
    mutate: updateUserProfileMutation,
    isPending,
    isSuccess
  } = useMutation({
    mutationFn: updateUserProfile,
    onMutate: (nickname) => {
      captureFormSubmitEvent({
        name: "changeNickname",
        properties: {
          nickname: nickname
        }
      });
    },
    onSuccess: () => {
      if (onSuccess) {
        onSuccess?.();
      } else {
        router.replace(redirectTo ?? "/");
      }
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

  const onSubmit = (data: ProfileSettingType) => {
    if (onFormSubmit) {
      onFormSubmit(data);
    } else {
      updateUserProfileMutation(data.nickname);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="nickname"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          닉네임
        </label>
        <div className="flex gap-2">
          <Input
            {...register("nickname", { required: true })}
            type="text"
            className="flex-1"
            role="textbox"
            placeholder="닉네임을 입력해주세요"
            onChange={(e) => setValue("nickname", e.target.value)}
          />
          <Button
            variant={"glass"}
            type="button"
            onClick={() => {
              setValue("nickname", getRandomNickname("animals"));
            }}
          >
            <RotateCcw />
          </Button>
        </div>
        {errors.nickname && (
          <p className="mt-2 text-sm text-red-600">{errors.nickname.message}</p>
        )}
      </div>
      <Button
        type="submit"
        variant="primary"
        className="w-full text-lg font-bold"
        disabled={isPending || isSuccess}
        aria-disabled={isPending || isSuccess}
      >
        저장하기
      </Button>
    </form>
  );
}
