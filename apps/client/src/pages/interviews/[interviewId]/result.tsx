import { getInterviewReport } from "@/domains/interviewReport/api/report";
import { FeedbackAccordion } from "@/domains/interviewReport/components/feedbackAccordion";
import { InterviewReport } from "@/domains/interviewReport/types";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { ParsedUrlQuery } from "querystring";
import { Layout } from "@kokomen/ui/components/layout";
import Image from "next/image";
import { Roboto } from "next/font/google";
import { Button } from "@kokomen/ui/components/button";
import { useRouter } from "next/router";
import Head from "next/head";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { JSX } from "react";
import { isAxiosError } from "axios";
import Header from "@/shared/header";

const roboto: NextFontWithVariable = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
});

export default function Result(
  data: InferGetServerSidePropsType<typeof getServerSideProps>
): JSX.Element {
  const navigate = useRouter();
  return (
    <>
      <Head>
        <title>꼬꼬면 면접 결과</title>
        <meta
          name="description"
          content="운영체제, 데이터베이스, 자료구조, 알고리즘 면접 연습"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout className={`${roboto.className}`}>
        <Header />
        <main className="p-8 flex w-full flex-col gap-5">
          <h1 className="text-3xl font-bold mb-4">면접 종료 및 피드백</h1>
          <div>
            <h2 className="text-2xl font-bold mb-4">각 항목별 피드백</h2>
            <FeedbackAccordion feedbacks={data.feedbacks} />
          </div>
          <div className="flex flex-col w-full">
            <h2 className="text-2xl font-bold mb-4">보완할 점</h2>
            <Image
              src="/interview/robot_standby.png"
              alt="robot standby"
              width={250}
              height={250}
              className="w-1/2 mb-10 ml-auto mr-auto"
            />
            <div className="border border-border-input p-4 rounded-xl">
              <p className="mb-5">{data.total_feedback}</p>
              <p className="text-2xl ml-auto text-right">
                그래서 점수는.... {data.total_score}점!
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">최종 점수</h2>
            <p className="text-7xl font-bold text-center mb-4">
              {data.user_prev_score} {"->"} {data.user_cur_score} (
              {data.user_cur_score - data.user_prev_score}){" "}
            </p>
          </div>
          <Button
            size={"large"}
            onClick={() => navigate.push({ pathname: "/" })}
          >
            홈으로
          </Button>
        </main>
      </Layout>
    </>
  );
}

interface PageParams extends ParsedUrlQuery {
  interview_id: string;
}
export const getServerSideProps: GetServerSideProps<
  InterviewReport,
  PageParams
> = async (context) => {
  const interviewId = context.params?.interviewId;
  if (!interviewId) {
    return {
      notFound: true,
    };
  }
  try {
    const { data } = await getInterviewReport(
      context.req.cookies,
      interviewId as string
    );
    return {
      props: {
        ...data,
      },
    };
  } catch (err) {
    if (isAxiosError(err)) {
      if (err.response?.status === 401) {
        return {
          redirect: {
            destination: "/login",
            permanent: false,
          },
        };
      }
    }
    return {
      notFound: true,
    };
  }
};
