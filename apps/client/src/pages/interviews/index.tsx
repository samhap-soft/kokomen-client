import { Category, getCategories } from "@/api/category";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { JSX } from "react";
import Header from "@/shared/header";
import { withCheckInServer } from "@/utils/auth";
import { User as UserIcon, Play } from "lucide-react";
import { getUserInfo } from "@/domains/auth/api";

import CreateInterviewForm from "@/domains/interview/components/createInterviewForm";
import useRouterPrefetch from "@/hooks/useRouterPrefetch";
import RankCard from "@/domains/members/components/rankCard";
import { SEO } from "@/shared/seo";
import { Button } from "@kokomen/ui";
import { CamelCasedProperties, Rank, UserInfo } from "@kokomen/types";
import { Footer } from "@/shared/footer";
import useExtendedRouter from "@/hooks/useExtendedRouter";
import { getRankList } from "@/domains/members/api";
import GuestInterviewModal from "@/domains/interview/components/guestInterviewModal";
import { useModal } from "@kokomen/utils";

export default function InterviewMainPage({
  categories,
  userInfo,
  rankList
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  useRouterPrefetch("/interviews");
  const router = useExtendedRouter();
  const {
    isOpen: isGuestModalOpen,
    openModal: openGuestModal,
    closeModal: closeGuestModal
  } = useModal();
  return (
    <>
      <SEO
        title="모의 면접 시작하기"
        description="운영체제, 데이터베이스, 자료구조, 알고리즘 등 개발자에게 필요한 여러 분야에 대해 모의 면접을 보고 연습해보세요!"
        robots="index, follow"
        image="/interview.png"
        pathname="/interviews"
      >
        <link rel="preload" href="/kokomenReport.png" as="image" />
      </SEO>
      <div className="min-h-screen">
        <Header user={userInfo} />
        <main className="flex flex-col-reverse lg:flex-row mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 gap-8 mb-16">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-9998347148036420"
            data-ad-slot="4601910391"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
          <CreateInterviewForm categories={categories} />

          <aside className="w-full lg:w-80 lg:sticky lg:top-8 shrink-0">
            <div>
              <div className="rounded-2xl border border-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center border border-border">
                    <UserIcon className="w-4 h-4 text-text-tertiary" />
                  </div>
                  <span className="text-sm font-semibold text-text-primary flex-1 truncate">
                    {userInfo?.nickname || "로그인 후 이용해주세요"}
                  </span>
                  {!userInfo && (
                    <Button
                      variant="soft"
                      className="text-xs font-semibold"
                      type="button"
                      onClick={() => router.navigateToLogin()}
                    >
                      로그인
                    </Button>
                  )}
                </div>
                {userInfo && (
                  <div className="grid grid-cols-2 divide-x divide-border">
                    <div className="px-4 py-3 text-center">
                      <p className="text-xs text-text-tertiary mb-0.5">
                        총 점수
                      </p>
                      <p className="text-lg font-bold text-text-primary tabular-nums">
                        {userInfo.score?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="px-4 py-3 text-center">
                      <p className="text-xs text-text-tertiary mb-0.5">
                        남은 토큰
                      </p>
                      <p className="text-lg font-bold text-text-primary tabular-nums">
                        {userInfo.token_count?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {!userInfo && (
              <>
                <button
                  type="button"
                  onClick={openGuestModal}
                  className="block mt-4 w-full text-left"
                >
                  <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold">
                          데모 면접 체험하기
                        </p>
                        <p className="text-xs text-white/80 mt-0.5">
                          로그인 없이 텍스트 면접을 체험해보세요
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
                <GuestInterviewModal
                  isOpen={isGuestModalOpen}
                  onClose={closeGuestModal}
                />
              </>
            )}
            <RankCard rankList={rankList} />
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
    rankList: CamelCasedProperties<Rank>[];
  }>
> => {
  return withCheckInServer<{
    categories: Category[];
    userInfo: UserInfo | null;
    rankList: CamelCasedProperties<Rank>[];
  }>(
    async () => {
      const [categoriesResponse, userInfoResponse, rankList] =
        await Promise.allSettled([
          getCategories(),
          getUserInfo(context),
          getRankList()
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
      const rankListData =
        rankList.status === "fulfilled" ? rankList.value : [];

      return {
        data: {
          categories: categoryData,
          userInfo: userInfoData,
          rankList: rankListData
        }
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
