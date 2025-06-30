import { Layout } from "@kokomen/ui/components/layout";
import { InterviewAnswerInput } from "@/domains/interview/components/interviewInput";
import Head from "next/head";
import React, { JSX, useEffect, useState } from "react";
import { useInterviewStatus } from "@/domains/interview/hooks/useInterviewStatus";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
} from "next";
import InterviewSideBar from "@/domains/interview/components/interviewSideBar";
import dynamic from "next/dynamic";
import InterviewModals from "@/domains/interview/components/interviewModals";
import { withCheckInServer } from "@/utils/auth";
import { getInterview } from "@/domains/interview/api";
import { Interview as InterviewType } from "@/domains/interview/types";

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

export default function Interview({
  cur_question,
  cur_question_id,
  max_question_count,
  prev_questions_and_answers,
  interviewId,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const { state, dispatch } = useInterviewStatus({
    questionId: cur_question_id,
    questionsAndAnswers: prev_questions_and_answers.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
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
              answeredQuestions={state.questionsAndAnswers.length}
              totalQuestions={max_question_count}
            />
          </div>
          <InterviewSideBar prevQuestionAndAnswer={state.questionsAndAnswers} />
        </div>
        <InterviewModals
          state={state}
          dispatch={dispatch}
          rootQuestion={cur_question}
        />
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  InterviewType & { interviewId: number }
> = async (
  context
): Promise<
  GetServerSidePropsResult<InterviewType & { interviewId: number }>
> => {
  const { interviewId } = context.query;

  if (!interviewId) {
    return {
      notFound: true,
    };
  }

  return withCheckInServer<InterviewType & { interviewId: number }>(
    async () => {
      const response = await getInterview(interviewId as string, context.req);
      if (response.data.interview_state === "FINISHED") {
        throw new Error("Finished Interview");
      }
      return {
        ...response.data,
        interviewId: +interviewId,
      };
    },
    {
      onError: (error) => {
        if (error instanceof Error && error.message === "Finished Interview") {
          return {
            redirect: {
              destination: `/interviews/${interviewId}/result`,
              permanent: false,
            },
          };
        }
        return {
          notFound: true,
        };
      },
    }
  );
};
