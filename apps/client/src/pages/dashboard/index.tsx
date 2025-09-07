import { getUserInfo } from "@/domains/auth/api";
import Header from "@/shared/header";
import { withCheckInServer } from "@/utils/auth";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { Coins, User, Star } from "lucide-react";
import SelectSection from "@/domains/dashboard/components/selectSection";
import { JSX } from "react";
import { getPercentileDisplay } from "@/utils/rankDisplay";
import { SEO } from "@/shared/seo";
import { Rank, Percentile } from "@kokomen/ui";
import { UserInfo } from "@kokomen/types";
import Streak from "@/domains/dashboard/components/streak";

export default function Dashboard({
  userInfo
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const percentile = userInfo
    ? Math.round((userInfo.rank / userInfo.total_member_count) * 100)
    : 0;

  return (
    <>
      <SEO title="대시보드" robots="noindex, nofollow, noarchive" />

      <main className="min-h-screen bg-bg-elevated">
        <Header user={userInfo} />
        <div className="mb-2 p-4 max-w-[1280px] mx-auto">
          <div className="rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 bg-bg-elevated">
            <div className="flex items-center justify-between md:flex-row flex-col gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-hover to-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold ">
                    {userInfo?.nickname || "사용자"}
                  </h1>
                </div>
              </div>
              <div className="text-right flex items-center gap-5 flex-col md:flex-row">
                {/* 랭킹 표시 */}
                <div className="flex items-center gap-2">
                  <Rank rank={userInfo?.rank} />
                  <Percentile
                    rank={userInfo?.rank}
                    totalMemberCount={userInfo?.total_member_count}
                  />
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
                  <span className="text-sm">전체 멤버 중 위치</span>
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
          <Streak />
        </div>
        <SelectSection userInfo={userInfo} />
      </main>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ userInfo: UserInfo }>> => {
  return withCheckInServer(
    async () => {
      const userInfo = await getUserInfo(context);
      return {
        data: {
          userInfo: userInfo.data
        }
      };
    },
    { context, redirectPathWhenUnauthorized: "/dashboard" }
  );
};
