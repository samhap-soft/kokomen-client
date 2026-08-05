import Header from "@/shared/header";
import { getUserInfo } from "@/domains/auth/api";
import { ResumeGuideModal } from "@/domains/resume/components";
import { UserInfo } from "@kokomen/types";
import { ErrorBoundary } from "@sentry/nextjs";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { Footer } from "@/shared/footer";
import { AxiosError } from "axios";
import { SEO } from "@/shared/seo";
import dynamic from "next/dynamic";
import React from "react";

const ResumeCombinedForm = dynamic(
  () => import("@/domains/resume/components/resumeCombinedForm"),
  {
    ssr: false
  }
);

export default function ResumePage({
  userInfo
}: InferGetServerSidePropsType<typeof getServerSideProps>): React.JSX.Element {
  return (
    <>
      <SEO
        title="이력서"
        description="내 이력서는 채용 공고에 얼마나 적합할까? 지금 꼬꼬면에서 이력서와 포트폴리오가 채용 공고에 얼마나 적합한지 평가하고, 이력서 기반 면접 질문까지 받아보세요."
        image="/resume.png"
        robots="index, follow"
        pathname="/resume"
      >
        <link rel="preload" href="/kokomenReport.png" as="image" />
      </SEO>
      <ResumeGuideModal />
      <main className="min-h-screen">
        <Header user={userInfo} />
        <div className="container mx-auto px-6 pt-6">
          <div className="relative flex flex-col gap-4 border-b border-border mb-6">
            <ErrorBoundary>
              <ResumeCombinedForm user={userInfo} />
            </ErrorBoundary>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ userInfo: UserInfo | null }>> => {
  const userInfo = await getUserInfo(context)
    .then((res) => res.data)
    .catch((error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return null;
      }
      throw error;
    });

  return {
    props: {
      userInfo
    }
  };
};
