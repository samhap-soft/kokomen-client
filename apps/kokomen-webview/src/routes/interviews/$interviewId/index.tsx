import { getInterview } from "@/domains/interviews/api";
import {
  createFileRoute,
  useLoaderData,
  useParams,
  useSearch
} from "@tanstack/react-router";
import { lazy, ReactNode, useState } from "react";
import {
  interviewKeys,
  useSidebar,
  CamelCasedProperties,
  useAudio
} from "@kokomen/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Interview, InterviewerEmotion, InterviewMode } from "@kokomen/types";
import { LoadingFullScreen } from "@kokomen/ui";
import ErrorComponent from "@/common/components/ErrorComponent";
import { InterviewAnswerForm } from "@/domains/interviews/components/interviewAnswerForm";
import { InterviewQuestion, InterviewSideBar } from "@kokomen/ui/domains";
import InterviewFinishModal from "@/domains/interviews/components/interviewFinishModal";
import InterviewStartModal from "@/domains/interviews/components/interviewStartModal";

// eslint-disable-next-line @rushstack/typedef-var
export const Route = createFileRoute("/interviews/$interviewId/")({
  component: RouteComponent,
  validateSearch: (search) => {
    if (!search.mode) throw new Error("mode is required");
    return {
      mode: search.mode as InterviewMode
    };
  },
  loaderDeps: ({ search: { mode } }) => ({ mode }),
  loader: ({
    params: { interviewId },
    context: { queryClient },
    deps: { mode }
  }) => {
    return getInterview(interviewId, mode).then((data) =>
      queryClient.setQueryData(
        interviewKeys.byInterviewId(Number(interviewId)),
        data
      )
    );
  },
  errorComponent: () => (
    <ErrorComponent
      cause="인터뷰를 찾을 수 없습니다."
      subText="인터뷰 링크가 잘못되었거나 본인의 인터뷰가 맞는지 확인해주세요."
    />
  ),
  pendingComponent: LoadingFullScreen
});

const AiInterviewInterface = lazy(() =>
  import("@kokomen/ui/domains").then((component) => ({
    default: component.AiInterviewInterface
  }))
);

const isTextInterview = (
  interview: CamelCasedProperties<Interview>
): interview is Extract<
  CamelCasedProperties<Interview>,
  { curQuestion: string }
> => {
  return "curQuestion" in interview;
};

const isVoiceInterview = (
  interview: CamelCasedProperties<Interview>
): interview is Extract<
  CamelCasedProperties<Interview>,
  { curQuestionVoiceUrl: string }
> => {
  return "curQuestionVoiceUrl" in interview;
};

// 현재 질문을 안전하게 가져오는 함수
const getCurrentQuestion = (
  interview: CamelCasedProperties<Interview>
): string => {
  if (isTextInterview(interview)) {
    return interview.curQuestion;
  }
  if (isVoiceInterview(interview)) {
    return interview.curQuestionVoiceUrl;
  }
  throw new Error("Invalid interview type");
};

function RouteComponent(): ReactNode {
  const [isInterviewStarted, setIsInterviewStarted] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { interviewId } = useParams({ from: "/interviews/$interviewId/" });
  const interviewData = useLoaderData({
    from: "/interviews/$interviewId/"
  }) as CamelCasedProperties<Interview>;
  const { mode } = useSearch({ from: "/interviews/$interviewId/" });

  // 인터뷰 질문 및 답변 사이드바 훅
  const { open: isSidebarOpen, openSidebar, closeSidebar } = useSidebar();

  const audioUrl = (() => {
    if (!interviewData) return "";
    if (isVoiceInterview(interviewData))
      return interviewData.curQuestionVoiceUrl;
    return "";
  })();

  // 면접관 캐릭터 끄덕거리게 하거나 대화하는 것처럼 보이게 하기
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [interviewerEmotion, setInterviewerEmotion] =
    useState<InterviewerEmotion>("happy");
  const { playAudio, playFinished } = useAudio(audioUrl, {
    onPlayEnd: () => setIsSpeaking(false),
    onPlayStart: () => setIsSpeaking(true)
  });

  //기존 면접 정보 업데이트
  const updateInterviewData = (
    updates: Partial<CamelCasedProperties<Interview>>
  ) => {
    const queryKey = interviewKeys.byInterviewId(Number(interviewId));

    queryClient.setQueryData(
      queryKey,
      (oldData: CamelCasedProperties<Interview>) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          ...updates
        };
      }
    );
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="mx-auto relative min-h-[720px] h-screen w-dvw flex min-w-0">
          <div className="flex flex-col flex-1 relative min-w-0">
            <InterviewQuestion
              interviewMode={mode}
              question={getCurrentQuestion(interviewData)}
              isInterviewStarted={isInterviewStarted}
              playFinished={playFinished}
              playAudio={playAudio}
            />
            <div className="min-h-[500px] flex-1 border-2 border-border rounded-lg">
              <div className="bg-gradient-to-r w-full h-full from-blue-50 to-primary-bg-hover relative rounded-lg">
                <AiInterviewInterface
                  emotion={interviewerEmotion}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                />
              </div>
            </div>
            <InterviewAnswerForm
              isInterviewStarted={isInterviewStarted}
              curQuestion={getCurrentQuestion(interviewData)}
              curQuestionId={interviewData.curQuestionId}
              prevQuestionsAndAnswers={interviewData.prevQuestionsAndAnswers}
              updateInterviewData={updateInterviewData}
              interviewId={Number(interviewId)}
              setInterviewerEmotion={setInterviewerEmotion}
              setIsListening={setIsListening}
              totalQuestions={interviewData.maxQuestionCount}
              mode={mode}
              playAudio={playAudio}
            />
          </div>
          <InterviewSideBar
            prevQuestionAndAnswer={interviewData.prevQuestionsAndAnswers}
            open={isSidebarOpen}
            openSidebar={openSidebar}
            closeSidebar={closeSidebar}
          />
        </div>
        <InterviewStartModal
          isInterviewStarted={isInterviewStarted}
          onInterviewStart={() => {
            setIsInterviewStarted(true);
            if (isVoiceInterview(interviewData)) {
              playAudio(interviewData.curQuestionVoiceUrl);
            }
          }}
          disabled={false}
          mode={mode}
        />
        <InterviewFinishModal
          interviewState={interviewData.interviewState}
          interviewId={Number(interviewId)}
        />
      </div>
    </>
  );
}
