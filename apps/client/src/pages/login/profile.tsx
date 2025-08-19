import { getUserInfo } from "@/domains/auth/api";
import { withCheckInServer } from "@/utils/auth";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { JSX } from "react";
import { Layout } from "@/components/layout";
import Header from "@/shared/header";
import ProfileSettingForm from "@/domains/auth/components/profilesettingForm";
import useRouterPrefetch from "@/hooks/useRouterPrefetch";
import { SEO } from "@/shared/seo";
import { UserInfo } from "@kokomen/types";

interface LoginProfileSettingProps {
  userInfo: UserInfo;
  state: string;
}

export default function LoginProfileSetting({
  userInfo,
  state
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  useRouterPrefetch(state || "/");
  return (
    <>
      <SEO
        title="프로필 설정"
        description="닉네임을 설정해주세요"
        robots="noindex, nofollow, noarchive"
      />
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

              <ProfileSettingForm userInfo={userInfo} redirectTo={state} />
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
          destination: (context.query.state as string) || "/",
          permanent: false
        }
      };
    }

    return {
      data: {
        userInfo: userInfo.data,
        state: (context.query.state as string) || "/"
      }
    };
  });
};
