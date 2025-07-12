import { getUserInfo } from "@/domains/auth/api";
import Header from "@/shared/header";
import { withCheckInServer } from "@/utils/auth";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import { Coins, User, Star, TrendingUp } from "lucide-react";
import InterviewHistory from "@/domains/dashboard/components/interviewHistory";
import { User as UserType } from "@/domains/auth/types";
import { JSX } from "react";
import { getRankDisplay, getPercentileDisplay } from "@/utils/rankDisplay";

export default function Dashboard({
  userInfo,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const percentile = userInfo
    ? Math.round((userInfo.rank / userInfo.total_member_count) * 100)
    : 0;

  const rankDisplay = userInfo ? getRankDisplay(userInfo.rank) : null;
  const RankIcon = rankDisplay?.icon;

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
          <div className="rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 bg-gradient-primary">
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
              <div className="text-right flex items-center gap-5 flex-col md:flex-row">
                {/* 랭킹 표시 */}
                <div className="flex items-center gap-2">
                  {userInfo && rankDisplay && RankIcon && (
                    <div
                      className={`flex items-center gap-2 text-lg font-semibold ${rankDisplay.bgColor} text-gray-700 rounded-xl px-4 py-2`}
                    >
                      <RankIcon className={`w-5 h-5 ${rankDisplay.color}`} />
                      <div>
                        <div className="text-sm font-medium">랭킹</div>
                        <div className="text-lg font-bold">
                          {userInfo.rank}위
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 상위 백분위 표시 */}
                  {userInfo && (
                    <div
                      className={`flex items-center gap-2 text-lg font-semibold ${getPercentileDisplay(percentile).bgColor} ${getPercentileDisplay(percentile).color} rounded-xl px-4 py-2`}
                    >
                      <TrendingUp className="w-5 h-5" />
                      <div>
                        <div className="text-sm font-medium">상위</div>
                        <div className="text-lg font-bold">{percentile}%</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ">
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

            {/* 랭킹 진행 바 */}
            {userInfo && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    전체 멤버 중 위치
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      getPercentileDisplay(percentile).color
                    }`}
                  >
                    상위 {percentile}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${100 - percentile}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{userInfo.total_member_count}위</span>
                  <span>1위</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <InterviewHistory />
      </main>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ userInfo: UserType }>> => {
  return withCheckInServer(
    async () => {
      const userInfo = await getUserInfo(context);
      return {
        data: {
          userInfo: userInfo.data,
        },
      };
    },
    { context }
  );
};
