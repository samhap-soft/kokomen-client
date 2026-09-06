import { Layout, LoadingFullScreen, Button } from "@kokomen/ui";
import { InterviewAnswerForm } from "@/domains/interview/components/interviewAnswerForm";
import { LiveCodingOverlay } from "@/domains/interview/components/liveCodingOverlay";
import { InterviewSideBar, useInterviewPhase } from "@kokomen/ui/domains";
import { Code2 } from "lucide-react";
import { useModal } from "@kokomen/utils";
import {
  publishInterviewEvent,
  useInterviewEvent
} from "@/domains/interview/utils/interviewEventEmitter";
import React, { JSX, useCallback, useEffect, useRef, useState } from "react";
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
import { InterviewNotFoundError } from "@/domains/interview/components/interviewNotFoundError";
import InterviewExitButton from "@/domains/interview/components/interviewExitButton";
import InterviewSettingsButton from "@/domains/interview/components/interviewSettingsButton";
import { useInterviewSettings } from "@/domains/interview/hooks/useInterviewSettings";
import { AlertTriangle } from "lucide-react";

// eslint-disable-next-line @rushstack/typedef-var
const CameraPreview = dynamic(
  () => import("@/domains/interview/components/cameraPreview"),
  { ssr: false }
);

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
  mode,
  isLiveCoding: isLiveCodingFromUrl
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const [isInterviewStarted, setIsInterviewStarted] = useState<boolean>(false);
  const knockAudioRef = useRef<HTMLAudioElement | null>(null);
  const enterAudioRef = useRef<HTMLAudioElement | null>(null);
  // eslint-disable-next-line no-unused-vars
  const playAudioRef = useRef<((url?: string) => Promise<void>) | null>(null);

  const { phase, startKnocking, startDoorOpening } = useInterviewPhase({
    onEntranceComplete: useCallback(() => {
      setIsInterviewStarted(true);
      // 재생 실패(오디오 요소 미준비, 브라우저 자동재생 차단 등)는 면접 진행을
      // 막지 않아야 한다. 처리하지 않으면 unhandled rejection이 된다.
      playAudioRef.current?.().catch(() => {});
    }, [])
  });

  const handleKnock = useCallback(() => {
    startKnocking();

    const playEnterAudio = (): void => {
      const enterAudio = new Audio("/interview/enter.mp3");
      enterAudioRef.current = enterAudio;
      enterAudio.onended = () => startDoorOpening();
      enterAudio.onerror = () => startDoorOpening();
      enterAudio.play().catch(() => {
        setTimeout(() => startDoorOpening(), 1000);
      });
    };

    const knockAudio = new Audio("/interview/knock.mp3");
    knockAudioRef.current = knockAudio;
    knockAudio.onended = playEnterAudio;
    knockAudio.onerror = () => {
      setTimeout(playEnterAudio, 500);
    };
    knockAudio.play().catch(() => {
      setTimeout(playEnterAudio, 500);
    });
  }, [startKnocking, startDoorOpening]);

  const {
    isOpen: isInterviewSidebarOpen,
    openModal: openInterviewSidebar,
    closeModal: closeInterviewSidebar
  } = useModal();
  const {
    isOpen: isLiveCodingOpen,
    openModal: openLiveCoding,
    closeModal: closeLiveCoding
  } = useModal();
  // 면접 중에도 켜고 끌 수 있는 옵션(답변 시간 제한 / 답변 수정 금지)
  const { settings, toggleSetting } = useInterviewSettings();

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
        publishInterviewEvent("interview:startVoiceRecognition");
      }
    },
    onPlayStart: () => {
      setIsSpeaking(true);
    }
  });
  useEffect(() => {
    playAudioRef.current = playAudio;
  }, [playAudio]);

  useInterviewEvent("interview:voiceRecognitionStarted", () => {
    setIsListening(true);
  });
  useInterviewEvent("interview:voiceRecognitionStopped", () => {
    setIsListening(false);
  });

  // 타입 안전한 방식으로 현재 질문 가져오기
  const currentQuestion = data
    ? data.interview_state !== "FINISHED"
      ? getCurrentQuestion(data)
      : "면접이 종료되었습니다. 고생하셨습니다."
    : "";

  // 라이브 코딩 여부: URL 쿼리(즉시 SSR 단계 분기용) ⇨ 서버 응답으로 보강
  const isLiveCoding =
    isLiveCodingFromUrl || (data?.include_live_coding ?? false);

  // CODE 면접의 원본 문제(첫 root question)를 한 번만 캡처
  const [originalProblem, setOriginalProblem] = useState<string>("");
  useEffect(() => {
    if (!isLiveCoding || originalProblem) return;
    if (!data || data.prev_questions_and_answers.length > 0) return;
    if (!isTextInterview(data)) return;
    setOriginalProblem(data.cur_question);
  }, [isLiveCoding, originalProblem, data]);

  //기존 면접 정보 업데이트
  const updateInterviewData = (updates: Partial<Interview>): void => {
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
        pathname={`/interviews/${interviewId}`}
      >
        <link rel="preload" as="image" href="/interviewBg.jpg" />
      </SEO>

      <Layout>
        {/*
          모바일에서는 고정 최소 높이(min-h-[720px])가 화면을 넘겨 답변 폼이 잘렸다.
          작은 화면에서는 세로 스크롤을 허용하고, sm 이상에서만 화면에 꽉 맞춘다.
        */}
        <div className="mx-auto relative w-full sm:min-h-[720px] h-dvh flex min-w-0">
          <div className="flex flex-col flex-1 relative min-w-0 overflow-y-auto sm:overflow-visible">
            {data?.is_demo && (
              <div className="flex items-center gap-2 px-4 py-2 pt-12 sm:pt-2 bg-amber-50 border-b border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-amber-800 font-medium">
                  데모 면접입니다. 로그인하면 더 많은 기능을 이용할 수 있어요.
                </span>
              </div>
            )}
            <InterviewQuestion
              interviewMode={mode}
              question={currentQuestion}
              isInterviewStarted={isInterviewStarted}
              playFinished={playFinished}
              playAudio={playAudio}
              isSpeaking={isSpeaking}
              isLiveCoding={
                isLiveCoding && data.prev_questions_and_answers.length === 0
              }
            />

            <div className="min-h-[280px] sm:min-h-[500px] flex-1 border-2 border-border rounded-lg">
              <div className="bg-gradient-to-r w-full h-full from-blue-50 to-primary-bg-hover relative rounded-lg">
                <AiInterviewInterface
                  avatarUrl={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/models/interviewer.glb`}
                  emotion={interviewerEmotion}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  phase={phase}
                  onKnock={handleKnock}
                  meetingRoomUrl="/interview/meeting_room.glb"
                  isLiveCoding={isLiveCoding}
                  onOpenLiveCoding={openLiveCoding}
                />
                {/* 표정 인식은 VOICE 전용 기능이 아니다. TEXT 모드에서도 쓸 수 있게 한다 */}
                <CameraPreview enabled={isInterviewStarted} />
                {isLiveCoding && isInterviewStarted && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={openLiveCoding}
                    className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 flex items-center gap-2 shadow-lg motion-safe:animate-slide-up"
                    aria-label="open-live-coding"
                  >
                    <Code2 className="w-4 h-4" />
                    코드 작성하기
                  </Button>
                )}
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
              isFinished={data.interview_state === "FINISHED"}
              isInterviewerSpeaking={isSpeaking}
              isTimeLimitEnabled={settings.isTimeLimitEnabled}
              isAppendOnlyEnabled={settings.isAppendOnlyEnabled}
            />
          </div>
          <InterviewExitButton />
          <InterviewSettingsButton
            settings={settings}
            onToggle={toggleSetting}
          />
          <InterviewSideBar
            open={isInterviewSidebarOpen}
            openSidebar={openInterviewSidebar}
            closeSidebar={closeInterviewSidebar}
            prevQuestionAndAnswer={data.prev_questions_and_answers}
            parseCode={isLiveCoding}
          />
        </div>
        {/* Entrance sequence replaces InterviewStartModal */}
        <InterviewFinishModal
          interviewState={data.interview_state}
          interviewId={interviewId}
        />
        {isLiveCoding && (
          <LiveCodingOverlay
            isOpen={isLiveCodingOpen}
            onClose={closeLiveCoding}
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
            totalQuestions={data.max_question_count}
            setInterviewerEmotion={setInterviewerEmotion}
            playAudio={playAudio}
            originalProblem={originalProblem}
          />
        )}
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  interviewId: number;
  mode: InterviewMode;
  isLiveCoding: boolean;
}> = async (
  context
): Promise<
  GetServerSidePropsResult<{
    interviewId: number;
    mode: InterviewMode;
    isLiveCoding: boolean;
  }>
> => {
  const { interviewId, mode, type } = context.query;

  // 쿼리는 문자열 또는 문자열 배열로 올 수 있고, 값 자체를 신뢰할 수 없다.
  const rawInterviewId = Array.isArray(interviewId) ? interviewId[0] : interviewId;
  const rawMode = Array.isArray(mode) ? mode[0] : mode;
  const rawType = Array.isArray(type) ? type[0] : type;

  const parsedInterviewId = Number(rawInterviewId);
  const isValidInterviewId =
    rawInterviewId !== undefined &&
    Number.isInteger(parsedInterviewId) &&
    parsedInterviewId > 0;
  const isValidMode = rawMode === "TEXT" || rawMode === "VOICE";

  if (!isValidInterviewId || !isValidMode) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      interviewId: parsedInterviewId,
      mode: rawMode as InterviewMode,
      isLiveCoding: rawType === "CODE"
    }
  };
};
