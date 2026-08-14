import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { JSX } from "react";
import { UserInfo } from "@kokomen/types";
import { getUserInfo } from "@/domains/auth/api";
import { withCheckInServer } from "@/utils/auth";
import Header from "@/shared/header";
import { SEO } from "@/shared/seo";
import useRouterPrefetch from "@/hooks/useRouterPrefetch";
import OnboardingForm from "@/domains/onboarding/components/onboardingForm";
import { hasSubmittedOnboarding } from "@/domains/onboarding/utils";

interface OnboardingPageProps {
  userInfo: UserInfo;
  redirectTo: string;
}

export default function OnboardingPage({
  userInfo,
  redirectTo
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  useRouterPrefetch(redirectTo || "/");
  return (
    <>
      <SEO
        title="맞춤 면접 설정"
        description="몇 가지 질문에 답하면 맞춤 면접을 추천해드려요."
        robots="noindex, nofollow, noarchive"
        pathname="/onboarding"
      />
      <div className="min-h-screen">
        <Header user={userInfo} />
        <main className="flex justify-center px-4 py-8 sm:py-12">
          <OnboardingForm redirectTo={redirectTo} />
        </main>
      </div>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<OnboardingPageProps>> => {
  const redirectTo: string = (context.query.redirectTo as string) || "/";

  return withCheckInServer<OnboardingPageProps>(
    async () => {
      const userInfo = await getUserInfo(context);

      // 닉네임 설정이 먼저다.
      if (!userInfo.data.profile_completed) {
        return {
          redirect: {
            destination: `/login/profile?state=${encodeURIComponent(redirectTo)}`,
            permanent: false
          }
        };
      }

      // 이미 작성한 사용자는 온보딩을 다시 보여주지 않는다.
      // 서버가 onboarding_form_filled를 내려주기 전까지는 제출 쿠키로도 판단한다.
      if (
        userInfo.data.onboarding_form_filled ||
        hasSubmittedOnboarding(context.req.cookies)
      ) {
        return {
          redirect: {
            destination: redirectTo,
            permanent: false
          }
        };
      }

      return {
        data: {
          userInfo: userInfo.data,
          redirectTo
        }
      };
    },
    { context, redirectPathWhenUnauthorized: "/onboarding" }
  );
};
