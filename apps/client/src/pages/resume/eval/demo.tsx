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
import Link from "next/link";

const ResumeEvalForm = dynamic(
  () => import("@/domains/resume/components/resumeEvaluationForm.demo"),
  {
    ssr: false
  }
);

export default function ResumeEvalDemoPage({
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
      >
        <link rel="preload" href="/kokomenReport.png" as="image" />
      </SEO>
      <main className="min-h-screen">
        <Header user={userInfo} />
        <div className="container mx-auto px-6 pt-6">
          <div className="relative flex flex-col gap-4 border-b border-border mb-6">
            <div className="flex flex-col w-full max-w-3xl mx-auto border border-border p-4 rounded-md">
              <h1 className="text-2xl font-bold text-text-heading">
                이력서 평가 데모
              </h1>
              <p className="text-text-secondary">
                체험을 위한 결과이며, 실제 서비스와 다를 수 있습니다.
              </p>
              <Link href="/resume/eval" className="text-primary font-bold">
                실제 이력서 평가하러 가기
              </Link>
            </div>
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
