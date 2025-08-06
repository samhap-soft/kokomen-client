import { getInterview } from "@/domains/interviews/api";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { lazy, ReactNode, useEffect, useState } from "react";
import {
  interviewKeys,
  useSidebar,
  CamelCasedProperties
} from "@kokomen/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Interview } from "@kokomen/types";
import { LoadingFullScreen } from "@kokomen/ui";
import ErrorComponent from "@/common/components/ErrorComponent";
import { InterviewAnswerInput } from "@/domains/interviews/components/interviewInput";
import { InterviewSideBar } from "@kokomen/ui/domains";
import { Button } from "@kokomen/ui";
import InterviewFinishModal from "@/domains/interviews/components/interviewFinishModal";

// eslint-disable-next-line @rushstack/typedef-var
export const Route = createFileRoute("/interviews/$interviewId/")({
  component: RouteComponent,
  loader: ({ params: { interviewId }, context: { queryClient } }) => {
    const interviewQueryOptions = {
      queryKey: interviewKeys.byInterviewId(Number(interviewId)),
      queryFn: () => getInterview(interviewId),
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1
    };
    return queryClient.ensureQueryData(interviewQueryOptions);
  },
  pendingComponent: LoadingFullScreen
});

const AiInterviewInterface = lazy(() =>
  import("@kokomen/ui/domains").then((component) => ({
    default: component.AiInterviewInterface
  }))
);

const START_UP_QUESTION: string =
  "꼬꼬면 면접에 오신걸 환영합니다. 준비가 되시면 버튼을 눌러 면접을 시작해주세요.";

function RouteComponent(): ReactNode {
  const [isInterviewStarted, setIsInterviewStarted] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { interviewId } = useParams({ from: "/interviews/$interviewId/" });

  // 인터뷰 질문 및 답변 사이드바 훅
  const { open: isSidebarOpen, openSidebar, closeSidebar } = useSidebar();

  const { data, isPending, isError } = useQuery<
    CamelCasedProperties<Interview>
  >({
    queryKey: interviewKeys.byInterviewId(Number(interviewId)),
    queryFn: () => getInterview(interviewId),
    initialData: () => ({
      interviewId: Number(interviewId),
      interviewState: "IN_PROGRESS",
      prevQuestionsAndAnswers: [],
      curQuestionId: 0,
      curQuestion: "",
      maxQuestionCount: 0,
      curQuestionCount: 0
    })
  });

  // 면접관 캐릭터 끄덕거리게 하거나 대화하는 것처럼 보이게 하기
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const listeningEmotion = isListening ? "happy" : "encouraging";
  const interviewerEmotion = isSpeaking ? "neutral" : listeningEmotion;

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

  useEffect(() => {
    setIsSpeaking(true);
    setTimeout(() => {
      setIsSpeaking(false);
    }, 4000);
  }, [data.curQuestion]);

  if (isError) return <ErrorComponent />;
  if (isPending) return <LoadingFullScreen />;

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="mx-auto relative min-h-[720px] h-screen w-dvw flex min-w-0">
          <div className="flex flex-col flex-1 relative min-w-0">
            <div className="p-4 absolute top-20 left-[10%] w-[80%] h-36 text-center border flex items-center justify-center max-h-[150px] z-20 border-border rounded-xl bg-bg-base">
              <div className="overflow-y-auto w-full max-h-full text-xl flex justify-center text-center align-middle">
                {isInterviewStarted ? data.curQuestion : START_UP_QUESTION}
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
              isInterviewStarted={isInterviewStarted}
              curQuestion={data.curQuestion}
              curQuestionId={data.curQuestionId}
              prevQuestionsAndAnswers={data.prevQuestionsAndAnswers}
              updateInterviewData={updateInterviewData}
              interviewId={Number(interviewId)}
              setIsListening={setIsListening}
              totalQuestions={data.maxQuestionCount}
            />
          </div>
          <InterviewSideBar
            prevQuestionAndAnswer={data.prevQuestionsAndAnswers}
            open={isSidebarOpen}
            openSidebar={openSidebar}
            closeSidebar={closeSidebar}
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
          interviewState={data.interviewState}
          interviewId={Number(interviewId)}
        />
      </div>
    </>
  );
}
