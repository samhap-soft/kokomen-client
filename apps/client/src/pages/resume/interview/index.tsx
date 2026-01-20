import Header from "@/shared/header";
import { getUserInfo } from "@/domains/auth/api";
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
import ResumeBasedInterviewForm from "@/domains/resume/components/resumeBasedInterviewForm";

export default function ResumeInterviewCreatePage({
  userInfo
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <SEO
        title="이력서 기반 면접 시작하기"
        description="내 이력서에서 어떤 질문을 받을까요? 이력서 기반 면접을 시작해보세요."
        image="/resume-interview.png"
        robots="index, follow"
        pathname="/resume/interview"
      />
      <main className="min-h-screen">
        <Header user={userInfo} />
        <div className="container mx-auto px-6 pt-6">
          <div className="relative flex gap-4 border-b border-border mb-6">
            <ErrorBoundary>
              <ResumeBasedInterviewForm user={userInfo as UserInfo} />
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
