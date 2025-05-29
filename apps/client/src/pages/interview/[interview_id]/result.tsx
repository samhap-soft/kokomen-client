import { getInterviewReport } from "@/domains/interviewReport/api/report";
import { FeedbackAccordion } from "@/domains/interviewReport/components/feedbackAccordion";
import { InterviewReport } from "@/domains/interviewReport/types";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { ParsedUrlQuery } from "querystring";
import { Layout } from "@kokomen/ui/components/common/Layout";
import Image from "next/image";
import Link from "next/link";
import { Roboto } from "next/font/google";
import { Button } from "@kokomen/ui/components/button/Button";
import { useRouter } from "next/router";

const roboto = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
});

export default function Result(
  data: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const navigate = useRouter();
  return (
    <Layout className={`${roboto.className}`}>
      <header className="px-4 py-2 border-b border-gray-300 justify-between flex w-full items-center">
        <div className="flex items-center gap-2">
          <Image src={"/icon.png"} alt="logo" width={50} height={50} />
          <span className="text-xl font-bold">꼬꼬면</span>
        </div>
        <ol className="flex gap-2">
          <li>
            <Link href={"/"}>홈</Link>
          </li>
        </ol>
      </header>
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
        <Button size={"xl"} onClick={() => navigate.push({ pathname: "/" })}>
          홈으로
        </Button>
      </main>
    </Layout>
  );
}

interface PageParams extends ParsedUrlQuery {
  interview_id: string;
}
export const getServerSideProps: GetServerSideProps<
  InterviewReport,
  PageParams
> = async (context) => {
  const interview_id = context.params?.interview_id;
  if (!interview_id) {
    return {
      notFound: true,
    };
  }
  try {
    const { data } = await getInterviewReport(interview_id);
    return {
      props: {
        ...data,
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
