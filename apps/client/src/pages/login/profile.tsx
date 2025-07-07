import { getUserInfo } from "@/domains/auth/api";
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
import ProfileSettingForm from "@/domains/auth/components/profilesettingForm";
import useRouterPrefetch from "@/hooks/useRouterPrefetch";

interface LoginProfileSettingProps {
  userInfo: User;
  state: string;
}

export default function LoginProfileSetting({
  userInfo,
  state,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  useRouterPrefetch(state || "/");
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
          permanent: false,
        },
      };
    }

    return {
      data: {
        userInfo: userInfo.data,
        state: (context.query.state as string) || "/",
      },
    };
  });
};
