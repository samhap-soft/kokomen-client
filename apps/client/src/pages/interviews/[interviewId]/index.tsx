import { Layout } from "@kokomen/ui/components/layout";
import { InterviewAnswerInput } from "@/domains/interview/components/interviewInput";
import { useRouter } from "next/router";
import Image from "next/image";
import InterviewModals from "@/domains/interview/components/interviewModals";
import Head from "next/head";
import { JSX } from "react";
import { useInterviewStatus } from "@/domains/interview/hooks/useInterviewStatus";
import { ROBOT_SOURCES } from "@/domains/interview/constants";

export default function Interview(): JSX.Element {
  const router = useRouter();
  const { interview_id, question_id, root_question } = router.query;
  const { state, dispatch } = useInterviewStatus({
    questionId: question_id ? parseInt(question_id as string, 10) : 0,
    rootQuestion: root_question as string,
  });

  return (
    <>
      <Head>
        <title>꼬꼬면 면접</title>
        <meta
          name="description"
          content="운영체제, 데이터베이스, 자료구조, 알고리즘 면접 연습"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" as="image" href="/interview/robot_question.png" />
        <link rel="preload" as="image" href="/interview/robot_standby.png" />
        <link rel="preload" as="image" href="/interview/robot_thinking.png" />
      </Head>
      <Layout className="relative p-8">
        <Image
          src="/interview/background.png"
          alt="Background"
          width={1280}
          height={720}
          className="absolute w-full h-[60%] object-cover z-0 top-0 left-0"
        />
        <div className="p-4 absolute top-10 left-[10%] w-3/4 h-36 text-center border flex items-center justify-center max-h-[150px] z-20 border-border-input rounded-xl bg-background-base">
          <div className="overflow-y-auto w-full max-h-full text-xl flex justify-center text-center align-middle">
            {state.message}
          </div>
        </div>
        <div className="absolute top-[25%] left-[30%] w-[40%] z-10">
          <Image
            src={ROBOT_SOURCES[state.status].src}
            alt={ROBOT_SOURCES[state.status].alt}
            width={300}
            height={300}
            className={`w-full absolute top-0 left-0`}
          />
        </div>
        <InterviewAnswerInput
          interviewState={state}
          dispatch={dispatch}
          interviewId={interview_id as string}
        />
        <InterviewModals
          state={state}
          dispatch={dispatch}
          rootQuestion={root_question as string}
        />
      </Layout>
    </>
  );
}
