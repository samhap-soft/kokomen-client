import { Layout } from "@kokomen/ui/components/layout";
import { InterviewAnswerInput } from "@/domains/interview/components/interviewInput";
import InterviewModals from "@/domains/interview/components/interviewModals";
import Head from "next/head";
import { JSX, Suspense, useEffect, useState } from "react";
import { useInterviewStatus } from "@/domains/interview/hooks/useInterviewStatus";
import { GetServerSideProps } from "next";
import {
  AIBackgroundImage,
  Interviewer,
} from "@/domains/interview/components/interviewer";
import InterviewSideBar from "@/domains/interview/components/interviewSideBar";
import { Canvas } from "@react-three/fiber";
import { Environment, Html } from "@react-three/drei";

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
              <div className="bg-gradient-to-b w-full h-full from-blue-50 to-indigo-100 relative rounded-lg">
                <Canvas
                  camera={{ position: [0, 0, 2], fov: 40 }}
                  shadows
                  dpr={[1, 2]}
                >
                  <Suspense
                    fallback={
                      <Html fullscreen>
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-nowrap bg-primary-bg-hover bg-opacity-80">
                          면접관님을 불러오고 있습니다...
                        </div>
                      </Html>
                    }
                  >
                    <AIBackgroundImage />
                    <Environment preset="lobby" resolution={2048} />
                    <Interviewer
                      emotion={interviewerEmotion}
                      isSpeaking={isSpeaking}
                      isListening={isListening}
                    />
                  </Suspense>
                </Canvas>
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
