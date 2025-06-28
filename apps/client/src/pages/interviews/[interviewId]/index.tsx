import { Layout } from "@kokomen/ui/components/layout";
import { InterviewAnswerInput } from "@/domains/interview/components/interviewInput";
import Head from "next/head";
import React, { JSX, useEffect, useState } from "react";
import { useInterviewStatus } from "@/domains/interview/hooks/useInterviewStatus";
import { GetServerSideProps } from "next";
import InterviewSideBar from "@/domains/interview/components/interviewSideBar";
import dynamic from "next/dynamic";
import InterviewModals from "@/domains/interview/components/interviewModals";

// eslint-disable-next-line @rushstack/typedef-var
const AiInterviewInterface = dynamic(
  () => import("@/domains/interview/components/AiInterviewInterface"),
  {
    ssr: false,
    loading: () => (
      <div className="font-bold text-xl text-center w-full h-full flex items-center justify-center">
        면접장을 정리하는 중...
      </div>
    ),
  }
);
interface InterviewProps {
  interviewId: string;
  questionId: string;
  root_question: string;
}

export default function Interview({
  interviewId,
  questionId,
  root_question,
}: InterviewProps): JSX.Element {
  const { state, dispatch } = useInterviewStatus({
    questionId: +questionId,
    rootQuestion: root_question,
  });
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    setIsSpeaking(true);
    setTimeout(() => {
      setIsSpeaking(false);
    }, 2000);
  }, [state.message]);

  const listeningEmotion = isListening ? "happy" : "encouraging";
  const interviewerEmotion = isSpeaking ? "neutral" : listeningEmotion;
  return (
    <>
      <Head>
        <title>꼬꼬면 면접</title>
        <meta
          name="description"
          content="운영체제, 데이터베이스, 자료구조, 알고리즘 면접 연습"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" as="image" href="/interviewBg.jpg" />
      </Head>
      <Layout>
        <div className="mx-auto relative min-h-[720px] h-screen w-dvw flex min-w-0">
          <div className="flex flex-col flex-1 relative min-w-0">
            <div className="p-4 absolute top-20 left-[10%] w-[80%] h-36 text-center border flex items-center justify-center max-h-[150px] z-20 border-border rounded-xl bg-bg-base">
              <div className="overflow-y-auto w-full max-h-full text-xl flex justify-center text-center align-middle">
                {state.message}
              </div>
            </div>
            <div className="min-h-[500px] flex-1 border-2 border-border rounded-lg">
              <div className="bg-gradient-to-r w-full h-full from-blue-50 to-primary-bg-hover relative rounded-lg">
                <AiInterviewInterface
                  emotion={interviewerEmotion}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                />
              </div>
            </div>
            <InterviewAnswerInput
              interviewState={state}
              dispatch={dispatch}
              interviewId={interviewId}
              setIsListening={setIsListening}
            />
          </div>
          <InterviewSideBar />
        </div>
        <InterviewModals
          state={state}
          dispatch={dispatch}
          rootQuestion={root_question}
        />
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { interviewId, questionId, root_question } = context.query;

  if (
    !interviewId ||
    !questionId ||
    !root_question ||
    Array.isArray(interviewId) ||
    Array.isArray(questionId) ||
    Array.isArray(root_question)
  ) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      interviewId,
      questionId,
      root_question,
    },
  };
};
