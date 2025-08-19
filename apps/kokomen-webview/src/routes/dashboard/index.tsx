import InterviewHistory from "@/domains/dashboard/components/interviewHistory";
import { useAuthStore, useUser } from "@/store";
import {
  createFileRoute,
  redirect,
  useLoaderData
} from "@tanstack/react-router";
import { Percentile, Rank } from "@kokomen/ui";
import { Coins, Star, User } from "lucide-react";
import { getUserInfo } from "@/domains/auth/api";
import { LoadingFullScreen } from "@kokomen/ui";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({
        to: "/login",
        viewTransition: true,
        search: {
          redirectTo: "/dashboard"
        }
      });
    }
  },
  loader: getUserInfo,
  pendingComponent: LoadingFullScreen
});

function RouteComponent() {
  const user = useUser();
  const { data: userInfo } = useLoaderData({ from: "/dashboard/" });

  if (!userInfo) {
    throw new Error("User info not found");
  }
  const percentile = Math.round(
    (userInfo.rank / userInfo.total_member_count) * 100
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="mb-2 p-4 max-w-[1280px] mx-auto">
        <div className="rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between md:flex-row flex-col gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-hover to-primary rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold break-all">
                  {user?.nickname || "사용자"}
                </h1>
              </div>
              <Rank rank={userInfo.rank} />
            </div>
            <div className="text-right flex items-center gap-5 flex-col md:flex-row">
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
                <span className="text-sm ">전체 멤버 중 위치</span>
                <Percentile
                  rank={userInfo.rank}
                  totalMemberCount={userInfo.total_member_count}
                />
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
  );
}
