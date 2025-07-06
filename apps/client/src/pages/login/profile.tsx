import { getUserInfo, updateUserProfile } from "@/domains/auth/api";
import { User } from "@/domains/auth/types";
import { withCheckInServer } from "@/utils/auth";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import { JSX } from "react";
import { Layout } from "@/components/layout";
import Header from "@/shared/header";
import { Input } from "@kokomen/ui/components/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@kokomen/ui/components/button";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { errorToast } from "@kokomen/ui/hooks/useToast";
import { AxiosError } from "axios";

interface LoginProfileSettingProps {
  userInfo: User;
  redirectTo: string;
}
// eslint-disable-next-line @rushstack/typedef-var
const ProfileSetting = z.object({
  nickname: z
    .string()
    .min(3, { message: "닉네임은 3자 이상이어야 합니다." })
    .max(20, { message: "닉네임은 20자 이하이어야 합니다." })
    .regex(/^[가-힣a-zA-Z0-9]+$/, {
      message: "닉네임은 한글 조합, 영문, 숫자만 사용할 수 있습니다.",
    }),
});
type ProfileSettingType = z.infer<typeof ProfileSetting>;

export default function LoginProfileSetting({
  userInfo,
  redirectTo,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileSettingType>({
    resolver: standardSchemaResolver(ProfileSetting),
    defaultValues: {
      nickname: userInfo.nickname,
    },
  });
  const router = useRouter();
  const { mutate: updateUserProfileMutation, isPending } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      router.replace(redirectTo ?? "/");
    },
    onError: (error: AxiosError) => {
      errorToast({
        title: "닉네임 변경에 실패했습니다.",
        description:
          (error.response?.data as { message: string }).message ??
          "서버 오류가 발생했습니다.",
      });
    },
  });

  const onSubmit = (data: ProfileSettingType) => {
    updateUserProfileMutation(data.nickname);
  };

  return (
    <>
      <Head>
        <title>꼬꼬면 면접</title>
        <meta
          name="description"
          content="운영체제, 데이터베이스, 자료구조, 알고리즘 면접 연습"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" as="image" href="/interviewBg.jpg" />
      </Head>
      <Layout>
        <Header user={userInfo} />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  프로필 설정
                </h1>
                <p className="text-gray-600 text-sm">닉네임을 설정해주세요</p>
              </div>

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
                    <p className="mt-2 text-sm text-red-600">
                      {errors.nickname.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isPending}
                  aria-disabled={isPending}
                >
                  저장하기
                </Button>
              </form>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<LoginProfileSettingProps>> => {
  return withCheckInServer<LoginProfileSettingProps>(async () => {
    const userInfo = await getUserInfo(context);
    if (userInfo.data.profile_completed) {
      return {
        redirect: {
          destination: (context.query.redirectTo as string) ?? "/",
          permanent: false,
        },
      };
    }

    return {
      data: {
        userInfo: userInfo.data,
        redirectTo: (context.query.redirectTo as string) ?? "/",
      },
    };
  });
};
