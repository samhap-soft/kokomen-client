import { getUserInfo } from "@/domains/auth/api";
import Header from "@/shared/header";
import { withCheckInServer } from "@/utils/auth";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { Coins, User, Star } from "lucide-react";
import InterviewHistory from "@/domains/dashboard/components/interviewHistory";

export default function Dashboard({
  userInfo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>대시보드 - 꼬꼬면</title>
        <meta
          name="description"
          content="운영체제, 데이터베이스, 자료구조, 알고리즘 면접 연습을 위한 체계적인 학습 플랫폼"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Header user={userInfo} />
        <div className="mb-2 p-4 max-w-[1280px] mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between md:flex-row flex-col gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-hover to-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userInfo?.nickname || "사용자"}
                  </h1>
                </div>
              </div>
              <div className="text-right flex items-center gap-5">
                {/* 점수 표시 */}
                <div className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-br from-primary-hover to-primary text-text-light-solid rounded-xl px-4 py-2">
                  <Star className="w-5 h-5" />
                  <span>{userInfo?.score || 0}점</span>
                </div>
                {/* 토큰 표시 */}
                <div className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-br from-gold-4 to-gold-6 text-text-light-solid rounded-xl px-4 py-2">
                  <Coins className="w-5 h-5" />
                  <span>{userInfo?.token_count || 0} 토큰</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <InterviewHistory />
      </main>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  return withCheckInServer(async () => {
    const userInfo = await getUserInfo(context);
    return {
      userInfo: userInfo.data,
    };
  });
};
