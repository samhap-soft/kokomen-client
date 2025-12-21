import { getUserInfo } from "@/domains/auth/api";
import { getResumeEvaluationResult } from "@/domains/resume/api";
import { ResumeEvaluationResult as ResumeEvaluationResultComponent } from "@/domains/resume/components";
import Header from "@/shared/header";
import { SEO } from "@/shared/seo";
import {
  CamelCasedProperties,
  ResumeEvaluationResult,
  UserInfo
} from "@kokomen/types";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";

export default function ResumeEvalResultPage({
  userInfo,
  resumeEvaluationState
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <SEO
        title="이력서 평가 결과"
        description="이력서와 포트폴리오가 채용공고와 직무에 얼마나 적합한지 평가한 결과를 확인해보세요."
        image="/resume.png"
        robots="noindex, nofollow, noarchive"
        pathname="/resume/eval"
      />
      <main className="min-h-screen">
        <Header user={userInfo} />
        <div className="container mx-auto px-6 pt-6">
          <ResumeEvaluationResultComponent report={resumeEvaluationState} />
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  userInfo: UserInfo | null;
  resumeEvaluationState: CamelCasedProperties<ResumeEvaluationResult>;
}> = async (
  context
): Promise<
  GetServerSidePropsResult<{
    userInfo: UserInfo | null;
    resumeEvaluationState: CamelCasedProperties<ResumeEvaluationResult>;
  }>
> => {
  try {
    const evaluationId = context.params?.evaluationId;
    if (!evaluationId) {
      return { notFound: true };
    }
    const response = await Promise.allSettled([
      getUserInfo(context),
      getResumeEvaluationResult(evaluationId as string, context)
    ]);

    const userInfo =
      response[0].status === "fulfilled" ? response[0].value.data : null;
    const resumeEvaluationState =
      response[1].status === "fulfilled" ? response[1].value : null;
    if (!resumeEvaluationState) {
      return { notFound: true };
    }
    return {
      props: {
        userInfo,
        resumeEvaluationState
      }
    };
  } catch (error) {
    return { redirect: { destination: "/error", permanent: false } };
  }
};
