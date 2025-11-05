import Header from "@/shared/header";
import { getUserInfo } from "@/domains/auth/api";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { Footer } from "@/shared/footer";
import { CamelCasedProperties, ResumeOutput, UserInfo } from "@kokomen/types";
import { SEO } from "@/shared/seo";
import dynamic from "next/dynamic";
import { useState } from "react";
import { ResumeEvaluationResult } from "@/domains/resume/components";
import { AxiosError } from "axios";

const ResumeEvalForm = dynamic(
  () => import("@/domains/resume/components/resumeEvaluationForm"),
  {
    ssr: false
  }
);

export default function ResumeEvalPage({
  userInfo
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [result, setResult] =
    useState<CamelCasedProperties<ResumeOutput> | null>(null);

  return (
    <>
      <SEO
        title="이력서 평가"
        description="이력서와 포트폴리오가 채용공고와 직무에 얼마나 적합한지 평가해보세요."
        image="/resume.png"
        robots="index, follow"
      />
      <main className="min-h-screen">
        <Header user={userInfo} />
        <div className="container mx-auto px-6 pt-6">
          <div className="relative flex gap-4 border-b border-border mb-6">
            {result ? (
              <ResumeEvaluationResult result={result} />
            ) : (
              <ResumeEvalForm setResult={setResult} />
            )}
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
