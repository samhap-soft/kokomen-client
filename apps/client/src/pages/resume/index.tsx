import Header from "@/shared/header";
import { getUserInfo } from "@/domains/auth/api";
import { ResumeSelectMenuNormal } from "@/domains/resume/components";
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

export default function ResumePage({
  userInfo
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <SEO
        title="이력서"
        description="내 이력서는 채용 공고에 얼마나 적합할까? 지금 꼬꼬면에서 이력서와 포트폴리오가 채용 공고에 얼마나 적합한지 평가해보세요."
        image="/resume.png"
        robots="index, follow"
      />
      <main className="min-h-screen">
        <Header user={userInfo} />
        <div className="container mx-auto px-6 pt-6">
          <div className="relative flex gap-4 border-b border-border mb-6">
            <ErrorBoundary>
              <ResumeSelectMenuNormal />
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
