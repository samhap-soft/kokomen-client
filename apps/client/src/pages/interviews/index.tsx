import { Category, getCategories } from "@/api/category";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { JSX, useEffect, useState } from "react";
import Header from "@/shared/header";
import { withCheckInServer } from "@/utils/auth";
import { getUserInfo } from "@/domains/auth/api";

import CreateInterviewForm from "@/domains/interview/components/createInterviewForm";
import useRouterPrefetch from "@/hooks/useRouterPrefetch";
import RankCard, {
  RANK_CARD_SIZE
} from "@/domains/members/components/rankCard";
import { SEO } from "@/shared/seo";
import { Button, Modal, TextButton } from "@kokomen/ui";
import { CamelCasedProperties, Rank, UserInfo } from "@kokomen/types";
import { Footer } from "@/shared/footer";
import useExtendedRouter from "@/hooks/useExtendedRouter";
import { getRankList } from "@/domains/members/api";
import GuestInterviewModal from "@/domains/interview/components/guestInterviewModal";
import { useModal } from "@kokomen/utils";
import Image from "next/image";
import { captureButtonEvent } from "@/utils/analytics";

function InfoCard({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}): JSX.Element {
  return (
    <div className="flex flex-col items-start gap-5 rounded-[20px] border border-border bg-bg-elevated px-6 py-[30px]">
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-semibold text-text-primary">{title}</h3>
        <p className="text-lg font-medium text-text-secondary">
          {description}
        </p>
      </div>
      <TextButton type="button" variant="primary" onClick={onAction}>
        {actionLabel}
      </TextButton>
    </div>
  );
}

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

  const GUEST_WELCOME_KEY = "kokomen_guest_welcome_shown";
  const ONE_DAY_MS = 86400000;
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      const lastShown = localStorage.getItem(GUEST_WELCOME_KEY);
      if (!lastShown || Date.now() - Number(lastShown) >= ONE_DAY_MS) {
        setShowWelcome(true);
      }
    }
  }, [userInfo]);

  const closeWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem(GUEST_WELCOME_KEY, Date.now().toString());
  };
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
        <main className="mx-auto mb-16 flex w-full max-w-[1182px] flex-col gap-[72px] px-5 pt-8 xl:px-0">
          <section className="flex flex-col gap-[50px]">
            <div className="flex flex-col gap-5">
              <h2 className="text-3xl font-bold text-text-primary md:text-4xl">
                오늘은 어떤 분야를 연습해볼까요?
              </h2>
              <p className="text-xl font-medium text-text-secondary">
                분야를 고르면 오른쪽에서 바로 시작할 수 있어요.
              </p>
            </div>
            <CreateInterviewForm categories={categories} />
          </section>

          <hr className="border-border" />

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {userInfo ? (
              <>
                <InfoCard
                  title="내 기록 보기"
                  description={`현재 ${(userInfo.score ?? 0).toLocaleString()}점 · 남은 토큰 ${(userInfo.token_count ?? 0).toLocaleString()}개`}
                  actionLabel="마이페이지"
                  onAction={() => router.push("/dashboard")}
                />
                <InfoCard
                  title="토큰 충전하기"
                  description="면접에 필요한 토큰을 미리 충전해 두세요."
                  actionLabel="충전하기"
                  onAction={() => router.push("/purchase")}
                />
              </>
            ) : (
              <>
                <InfoCard
                  title="로그인하고 기록 남기기"
                  description="면접 결과와 피드백이 마이페이지에 저장돼요."
                  actionLabel="로그인하기"
                  onAction={() => router.navigateToLogin()}
                />
                <InfoCard
                  title="데모 면접 체험하기"
                  description="로그인 없이 꼬꼬면을 먼저 경험해 보세요."
                  actionLabel="체험하기"
                  onAction={() => {
                    captureButtonEvent({ name: "DemoInterviewCTAClicked" });
                    openGuestModal();
                  }}
                />
                <GuestInterviewModal
                  isOpen={isGuestModalOpen}
                  onClose={closeGuestModal}
                />
              </>
            )}
            <RankCard rankList={rankList} />
          </section>

          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-9998347148036420"
            data-ad-slot="4601910391"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </main>
        {showWelcome && (
          <Modal
            isOpen={showWelcome}
            onClose={closeWelcome}
            title="환영합니다!"
            size="xl"
            backdropClose
            transparentBackdrop
          >
            <div className="space-y-4 text-center">
              <Image
                src="/kokobot/interview_induction.png"
                alt="interview_induction"
                width={1100}
                height={740}
                className="w-full"
              />
              <div className="space-y-2">
                <p className="text-xl font-medium text-text-primary">
                  비회원으로 모의면접을 이용해 보세요!
                </p>
                <p className="text-base text-text-secondary">
                  로그인 없이도 데모 면접을 체험할 수 있어요.
                </p>
              </div>
              <Button
                variant="primary"
                size="large"
                className="w-full font-semibold"
                onClick={closeWelcome}
              >
                확인
              </Button>
            </div>
          </Modal>
        )}
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
          getCategories(context),
          getUserInfo(context),
          getRankList(0, RANK_CARD_SIZE)
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
