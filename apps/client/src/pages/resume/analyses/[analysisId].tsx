import { getUserInfo } from "@/domains/auth/api";
import { getResumeAnalysis } from "@/domains/resume/api/resumeAnalysis";
import { ResumeCombinedResult } from "@/domains/resume/components";
import Header from "@/shared/header";
import { Footer } from "@/shared/footer";
import { SEO } from "@/shared/seo";
import { ResumeAnalysis, UserInfo } from "@kokomen/types";
import { ErrorBoundary } from "@sentry/nextjs";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import React from "react";

export default function ResumeAnalysisResultPage({
  userInfo,
  analysis
}: InferGetServerSidePropsType<typeof getServerSideProps>): React.JSX.Element {
  return (
    <>
      <SEO
        title="이력서 분석 결과"
        description="이력서와 포트폴리오가 채용 공고와 직무에 얼마나 적합한지 평가한 결과와, 이력서 기반 면접 질문을 확인해보세요."
        image="/resume.png"
        robots="noindex, nofollow, noarchive"
        pathname="/resume"
      />
      <main className="min-h-screen">
        <Header user={userInfo} />
        <div className="container mx-auto px-6 pt-6">
          <ErrorBoundary>
            <ResumeCombinedResult analysis={analysis} user={userInfo} />
          </ErrorBoundary>
        </div>
        <Footer />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  userInfo: UserInfo | null;
  analysis: ResumeAnalysis;
}> = async (
  context
): Promise<
  GetServerSidePropsResult<{
    userInfo: UserInfo | null;
    analysis: ResumeAnalysis;
  }>
> => {
  const analysisId = context.params?.analysisId;
  if (!analysisId) {
    return { notFound: true };
  }
  // 비회원은 제출 시 받은 guest_token으로 소유를 증명한다
  const guestToken =
    typeof context.query.guest_token === "string"
      ? context.query.guest_token
      : undefined;

  const [userInfoResult, analysisResult] = await Promise.allSettled([
    getUserInfo(context),
    getResumeAnalysis(analysisId as string, context, guestToken)
  ]);

  const userInfo =
    userInfoResult.status === "fulfilled" ? userInfoResult.value.data : null;

  if (analysisResult.status !== "fulfilled") {
    return { notFound: true };
  }

  const analysis = analysisResult.value;
  // 평가가 끝나기 전이거나 평가 자체가 실패했다면 보여줄 결과가 없다
  if (!analysis.evaluation) {
    return { redirect: { destination: "/resume", permanent: false } };
  }

  return {
    props: {
      userInfo,
      analysis
    }
  };
};
