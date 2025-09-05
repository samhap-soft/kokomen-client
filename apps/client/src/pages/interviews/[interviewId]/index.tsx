import { Layout, LoadingFullScreen } from "@kokomen/ui";
import { InterviewAnswerForm } from "@/domains/interview/components/interviewAnswerForm";
import { InterviewSideBar } from "@kokomen/ui/domains";
import { useModal } from "@kokomen/utils";
import {
  interviewEventHelpers,
  useInterviewEvent
} from "@/domains/interview/utils/interviewEventEmitter";
import React, { JSX, useState } from "react";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import dynamic from "next/dynamic";
import { useAudio } from "@kokomen/utils";
import { getInterview } from "@/domains/interview/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { interviewKeys } from "@/utils/querykeys";
import { Interview, InterviewMode } from "@kokomen/types";
import InterviewFinishModal from "@/domains/interview/components/interviewFinishModal";
import { SEO } from "@/shared/seo";
import { InterviewQuestion } from "@/domains/interview/components/interviewQuestion";
import InterviewStartModal from "@/domains/interview/components/interviewStartModal";
import { InterviewNotFoundError } from "@/domains/interview/components/interviewNotFoundError";

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

const isTextInterview = (
  interview: Interview
): interview is Extract<Interview, { cur_question: string }> => {
  return "cur_question" in interview;
};

const isVoiceInterview = (
  interview: Interview
): interview is Extract<Interview, { cur_question_voice_url: string }> => {
  return "cur_question_voice_url" in interview;
};

// 현재 질문을 안전하게 가져오는 함수
const getCurrentQuestion = (interview: Interview): string => {
  if (isTextInterview(interview)) {
    return interview.cur_question;
  }
  if (isVoiceInterview(interview)) {
    return interview.cur_question_voice_url;
  }
  throw new Error("Invalid interview type");
};

export default function InterviewPage({
  interviewId,
  mode
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
    queryFn: () => getInterview(interviewId.toString(), mode)
  });

  // data가 존재하고 voice interview인 경우에만 voice_url 사용
  const audioUrl = (() => {
    if (!data) return "";
    if (isVoiceInterview(data)) return data.cur_question_voice_url;
    return "";
  })();

  // 면접관 캐릭터 끄덕거리게 하거나 대화하는 것처럼 보이게 하기
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [interviewerEmotion, setInterviewerEmotion] =
    useState<InterviewerEmotion>("neutral");

  const { playAudio, playFinished } = useAudio(audioUrl, {
    onPlayEnd: () => {
      setIsSpeaking(false);
      if (mode === "VOICE") {
        interviewEventHelpers.startVoiceRecognition();
      }
    },
    onPlayStart: () => {
      setIsSpeaking(true);
    }
  });
  useInterviewEvent("voiceRecognitionStarted", () => {
    setIsListening(true);
  });
  useInterviewEvent("voiceRecognitionStopped", () => {
    setIsListening(false);
  });

  // 타입 안전한 방식으로 현재 질문 가져오기
  const currentQuestion = data ? getCurrentQuestion(data) : "";

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

  if (isPending) return <LoadingFullScreen className="h-screen w-screen" />;
  if (isError) return <InterviewNotFoundError />;
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
            <InterviewQuestion
              interviewMode={mode}
              question={currentQuestion}
              isInterviewStarted={isInterviewStarted}
              playFinished={playFinished}
              playAudio={playAudio}
            />

            <div className="min-h-[500px] flex-1 border-2 border-border rounded-lg">
              <div className="bg-gradient-to-r w-full h-full from-blue-50 to-primary-bg-hover relative rounded-lg">
                <AiInterviewInterface
                  avatarUrl={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/models/interviewer.glb`}
                  emotion={interviewerEmotion}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                />
              </div>
            </div>
            <InterviewAnswerForm
              setInterviewerEmotion={setInterviewerEmotion}
              isInterviewStarted={isInterviewStarted}
              cur_question={
                isTextInterview(data)
                  ? data.cur_question
                  : data.cur_question_voice_url
              }
              cur_question_id={data.cur_question_id}
              prev_questions_and_answers={data.prev_questions_and_answers}
              updateInterviewData={updateInterviewData}
              interviewId={interviewId}
              setIsListening={setIsListening}
              totalQuestions={data.max_question_count}
              playAudio={playAudio}
              mode={mode}
            />
          </div>
          <InterviewSideBar
            open={isInterviewSidebarOpen}
            openSidebar={openInterviewSidebar}
            closeSidebar={closeInterviewSidebar}
            prevQuestionAndAnswer={data.prev_questions_and_answers}
          />
        </div>
        <InterviewStartModal
          isInterviewStarted={isInterviewStarted}
          disabled={isPending}
          onInterviewStart={() => {
            setIsInterviewStarted(true);
            if (isVoiceInterview(data)) {
              playAudio(data.cur_question_voice_url);
            }
          }}
        />
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
  mode: InterviewMode;
}> = async (
  context
): Promise<
  GetServerSidePropsResult<{ interviewId: number; mode: InterviewMode }>
> => {
  const { interviewId, mode } = context.query;

  if (!interviewId || !mode) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      interviewId: +interviewId,
      mode: mode as InterviewMode
    }
  };
};
