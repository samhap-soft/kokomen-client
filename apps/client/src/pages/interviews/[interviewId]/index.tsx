import { Layout, LoadingFullScreen } from "@kokomen/ui";
import { InterviewAnswerInput } from "@/domains/interview/components/interviewInput";
import { InterviewSideBar } from "@kokomen/ui/domains";
import { useModal } from "@kokomen/utils";
import React, { JSX, useEffect, useState } from "react";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import dynamic from "next/dynamic";
import { getInterview } from "@/domains/interview/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { interviewKeys } from "@/utils/querykeys";
import { Button } from "@kokomen/ui";
import { Interview } from "@/domains/interview/types";
import InterviewFinishModal from "@/domains/interview/components/interviewFinishModal";
import { SEO } from "@/shared/seo";

// eslint-disable-next-line @rushstack/typedef-var
const AiInterviewInterface = dynamic(
  () =>
    import("@kokomen/ui/domains").then(
      (component) => component.AiInterviewInterface
    ),
  {
    ssr: false,
    loading: () => (
      <div className="font-bold text-xl text-center w-full h-full flex items-center justify-center">
        면접장을 정리하는 중...
      </div>
    )
  }
);

export type InterviewerEmotion = "happy" | "encouraging" | "angry" | "neutral";

const START_UP_QUESTION: string =
  "꼬꼬면 면접에 오신걸 환영합니다. 준비가 되시면 버튼을 눌러 면접을 시작해주세요.";
export default function InterviewPage({
  interviewId
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const [isInterviewStarted, setIsInterviewStarted] = useState<boolean>(false);
  const {
    isOpen: isInterviewSidebarOpen,
    openModal: openInterviewSidebar,
    closeModal: closeInterviewSidebar
  } = useModal();
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useQuery({
    queryKey: interviewKeys.byInterviewId(interviewId),
    queryFn: () => getInterview(interviewId.toString()),
    initialData: {
      interview_state: "IN_PROGRESS",
      prev_questions_and_answers: [],
      cur_question_id: 0,
      cur_question: "",
      cur_question_count: 0,
      max_question_count: 0
    }
  });

  //기존 면접 정보 업데이트
  const updateInterviewData = (updates: Partial<Interview>) => {
    const queryKey = interviewKeys.byInterviewId(interviewId);

    queryClient.setQueryData(queryKey, (oldData: Interview) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        ...updates
      };
    });
  };

  // 면접관 캐릭터 끄덕거리게 하거나 대화하는 것처럼 보이게 하기
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [interviewerEmotion, setInterviewerEmotion] =
    useState<InterviewerEmotion>("happy");

  useEffect(() => {
    setIsSpeaking(true);
    setTimeout(() => {
      setIsSpeaking(false);
    }, 4000);
  }, [data.cur_question]);

  if (isPending) return <LoadingFullScreen />;
  if (isError) throw new Error("인터뷰 정보를 불러오는데 실패했습니다.");

  return (
    <>
      <SEO
        title="모의 면접"
        description="운영체제, 데이터베이스, 자료구조, 알고리즘 면접 연습"
        robots="noindex, nofollow, noarchive"
      >
        <link rel="preload" as="image" href="/interviewBg.jpg" />
      </SEO>

      <Layout>
        <div className="mx-auto relative min-h-[720px] h-screen w-dvw flex min-w-0">
          <div className="flex flex-col flex-1 relative min-w-0">
            <div className="p-4 absolute top-20 left-[10%] w-[80%] h-36 text-center border flex items-center justify-center max-h-[150px] z-20 border-border rounded-xl bg-bg-base">
              <div className="overflow-y-auto w-full max-h-full text-xl flex justify-center text-center align-middle">
                {isInterviewStarted ? data.cur_question : START_UP_QUESTION}
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
              setInterviewerEmotion={setInterviewerEmotion}
              isInterviewStarted={isInterviewStarted}
              cur_question={data.cur_question}
              cur_question_id={data.cur_question_id}
              prev_questions_and_answers={data.prev_questions_and_answers}
              updateInterviewData={updateInterviewData}
              interviewId={interviewId}
              setIsListening={setIsListening}
              totalQuestions={data.max_question_count}
            />
          </div>
          <InterviewSideBar
            open={isInterviewSidebarOpen}
            openSidebar={openInterviewSidebar}
            closeSidebar={closeInterviewSidebar}
            prevQuestionAndAnswer={data.prev_questions_and_answers}
          />
        </div>
        {!isInterviewStarted && (
          <Button
            className="w-1/2 absolute bottom-40 left-1/4 text-xl font-bold"
            variant={"primary"}
            size={"xl"}
            disabled={isPending}
            onClick={() => setIsInterviewStarted(true)}
          >
            면접 시작하기
          </Button>
        )}
        <InterviewFinishModal
          interviewState={data.interview_state}
          interviewId={interviewId}
        />
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  interviewId: number;
}> = async (
  context
): Promise<GetServerSidePropsResult<{ interviewId: number }>> => {
  const { interviewId } = context.query;

  if (!interviewId) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      interviewId: +interviewId
    }
  };
};
