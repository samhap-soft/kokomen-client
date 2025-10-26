import { Category, getCategories } from "@/api/category";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { JSX } from "react";
import Header from "@/shared/header";
import { withCheckInServer } from "@/utils/auth";
import { Trophy, Coins, User as UserIcon, Star } from "lucide-react";
import { getUserInfo } from "@/domains/auth/api";

import CreateInterviewForm from "@/domains/interview/components/createInterviewForm";
import useRouterPrefetch from "@/hooks/useRouterPrefetch";
import RankCard from "@/domains/members/components/rankCard";
import { SEO } from "@/shared/seo";
import { Button } from "@kokomen/ui";
import { useRouter } from "next/router";
import { UserInfo } from "@kokomen/types";
import { Footer } from "@/shared/footer";

export default function InterviewMainPage({
  categories,
  userInfo
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  useRouterPrefetch("/interviews");
  const router = useRouter();
  return (
    <>
      <SEO
        title="모의 면접 시작하기"
        description="운영체제, 데이터베이스, 자료구조, 알고리즘 등 개발자에게 필요한 여러 분야에 대해 모의 면접을 보고 연습해보세요!"
        robots="index, follow"
      />
      <div className="min-h-screen">
        <Header user={userInfo} />
        <main className="flex flex-col-reverse lg:flex-row lg:items-start mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 gap-8 mb-16">
          <CreateInterviewForm categories={categories} />

          <aside className="w-full lg:w-96">
            <div>
              <div className="bg-bg-elevated rounded-3xl border border-primary-border shadow-2xl overflow-hidden">
                {/* 헤더 섹션 */}
                <div className="p-6 relative overflow-hidden border-b border-primary-border">
                  <div className="relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-primary-border">
                          <UserIcon className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">
                          {userInfo?.nickname || "로그인 후 이용해주세요."}
                        </h3>
                      </div>
                      {!userInfo && (
                        <Button
                          variant="soft"
                          className="font-bold"
                          type="button"
                          onClick={() => router.push("/login")}
                        >
                          로그인
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 통계 섹션 */}
                {userInfo && (
                  <div className="p-6">
                    <div className="flex flex-col gap-4 mb-6">
                      <div className="group relative bg-gold-1 rounded-xl p-4 border border-gold-3 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gold-6 rounded-lg flex items-center justify-center shadow-sm">
                            <Trophy className="w-5 h-5 text-text-light-solid" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gold-8 mb-1">
                              총 점수
                            </p>
                            <p className="text-xl font-bold text-gold-9">
                              {userInfo?.score || 0}
                            </p>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Star className="w-4 h-4 text-gold-6" />
                        </div>
                      </div>

                      <div className="group relative bg-green-1 rounded-xl p-4 border border-green-3 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-6 rounded-lg flex items-center justify-center shadow-sm">
                            <Coins className="w-5 h-5 text-text-light-solid" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-green-8 mb-1">
                              남은 토큰
                            </p>
                            <p className="text-xl font-bold text-green-9">
                              {userInfo?.token_count || 0}
                            </p>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-4 h-4 bg-green-6 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <RankCard />
          </aside>
        </main>
        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<
  GetServerSidePropsResult<{
    categories: Category[];
    userInfo: UserInfo | null;
  }>
> => {
  return withCheckInServer<{
    categories: Category[];
    userInfo: UserInfo | null;
  }>(
    async () => {
      const [categoriesResponse, userInfoResponse] = await Promise.allSettled([
        getCategories(),
        getUserInfo(context)
      ]);

      if (categoriesResponse.status === "rejected") {
        return {
          redirect: {
            destination: "/error",
            permanent: false
          }
        };
      }
      const categoryData = categoriesResponse.value.data;
      const userInfoData =
        userInfoResponse.status === "fulfilled"
          ? userInfoResponse.value.data
          : null;

      return {
        data: { categories: categoryData, userInfo: userInfoData }
      };
    },
    {
      onError: () => {
        return {
          redirect: {
            destination: "/500",
            permanent: false
          }
        };
      },
      context
    }
  );
};
