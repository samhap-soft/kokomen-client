import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@kokomen/ui";
import { AxiosError } from "axios";
import z from "zod";
import { updateUserProfile } from "@/domains/auth/api";
import { Input } from "@kokomen/ui";
import { Button } from "@kokomen/ui";
import { User } from "@kokomen/types";
import { useRouter } from "@tanstack/react-router";

// eslint-disable-next-line @rushstack/typedef-var
const ProfileSetting = z.object({
  nickname: z
    .string()
    .min(2, { message: "닉네임은 2자 이상이어야 합니다." })
    .max(20, { message: "닉네임은 20자 이하이어야 합니다." })
    .regex(/^[가-힣a-zA-Z0-9]+$/, {
      message: "닉네임은 한글 조합, 영문, 숫자만 사용할 수 있습니다."
    })
});
type ProfileSettingType = z.infer<typeof ProfileSetting>;

export default function ProfileSettingForm({
  userInfo,
  redirectTo
}: {
  userInfo: User;
  redirectTo: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<ProfileSettingType>({
    resolver: standardSchemaResolver(ProfileSetting),
    defaultValues: {
      nickname: userInfo.nickname
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
    onSuccess: () => {
      router.navigate({ to: redirectTo ?? "/interviews" });
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
    updateUserProfileMutation(data.nickname);
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
        <Input
          {...register("nickname", { required: true })}
          type="text"
          className="w-full"
          role="textbox"
          placeholder="닉네임을 입력해주세요"
          onChange={(e) => setValue("nickname", e.target.value)}
        />
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
