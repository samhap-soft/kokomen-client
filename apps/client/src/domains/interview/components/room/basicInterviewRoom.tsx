import { getInterview } from "@/domains/interview/api";
import { useInterviewerReaction } from "@/domains/interview/hooks/useInterviewerReaction";
import { useSelectedInterviewer } from "@/domains/interview/hooks/useSelectedInterviewer";
import {
  AnswerNotices,
  AnswerSubmitButton,
  AnswerTextarea,
  useInterviewAnswer
} from "@/domains/interview/components/interviewAnswerForm";
import InterviewFinishModal from "@/domains/interview/components/interviewFinishModal";
import { InterviewExitModal } from "@/domains/interview/components/interviewExitModal";
import { InterviewNotFoundError } from "@/domains/interview/components/interviewNotFoundError";
import { InterviewSettingsModal } from "@/domains/interview/components/interviewSettingsModal";
import {
  LiveCodingSubmitButton,
  LiveCodingWorkspace,
  useLiveCodingAnswer
} from "@/domains/interview/components/liveCodingWorkspace";
import { useInterviewSettings } from "@/domains/interview/hooks/useInterviewSettings";
import {
  publishInterviewEvent,
  useInterviewEvent
} from "@/domains/interview/utils/interviewEventEmitter";
import { interviewKeys } from "@/utils/querykeys";
import { Interview, InterviewMode } from "@kokomen/types";
import {
  Button,
  LoadingFullScreen,
  MicIcon,
  MicOffIcon,
  VolumeOnIcon
} from "@kokomen/ui";
import {
  AnswerHistoryPanel,
  CurrentQuestion,
  InterviewControlBar,
  InterviewControlAction,
  InterviewRoomHeader,
  InterviewRoomLayout,
  RecordingIndicator,
  TextAnswerWorkspace
} from "@kokomen/ui/domains";
import { useAudio, useModal } from "@kokomen/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { JSX, useCallback, useEffect, useState } from "react";
import { InterviewLobbyScreen } from "./interviewLobbyScreen";
import { InterviewerTile, SelfCameraTile } from "./roomTiles";
import { useRoomMedia } from "./useRoomMedia";

const isTextInterview = (
  interview: Interview
): interview is Extract<Interview, { cur_question: string }> =>
  "cur_question" in interview;

const isVoiceInterview = (
  interview: Interview
): interview is Extract<Interview, { cur_question_voice_url: string }> =>
  "cur_question_voice_url" in interview;

const getCurrentQuestion = (interview: Interview): string => {
  if (isTextInterview(interview)) return interview.cur_question;
  if (isVoiceInterview(interview)) return interview.cur_question_voice_url;
  throw new Error("Invalid interview type");
};

const MODE_LABELS: Record<InterviewMode, string> = {
  TEXT: "텍스트 면접",
  VOICE: "음성 면접"
};

type BasicInterviewRoomProps = {
  interviewId: number;
  mode: InterviewMode;
  isLiveCoding: boolean;
  categoryTitle: string | null;
};

/**
 * 기본 면접(텍스트 · 음성 · 라이브 코딩) 면접실.
 * Figma: 인터뷰 / to-be 1172:2426(텍스트) · 1172:2473(음성) · 1172:2527(답변 기록)
 */
export function BasicInterviewRoom(props: BasicInterviewRoomProps): JSX.Element {
  const { data, isPending, isError } = useQuery({
    queryKey: interviewKeys.byInterviewId(props.interviewId),
    queryFn: () => getInterview(props.interviewId.toString(), props.mode)
  });

  if (isPending) return <LoadingFullScreen className="h-screen w-screen" />;
  if (isError) return <InterviewNotFoundError />;
  return <BasicInterviewRoomContent {...props} data={data} />;
}

function BasicInterviewRoomContent({
  interviewId,
  mode,
  isLiveCoding: isLiveCodingFromUrl,
  categoryTitle,
  data
}: BasicInterviewRoomProps & { data: Interview }): JSX.Element {
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  // 예전 3D 면접관이 "듣는 중" 동작에 쓰던 값이다. 영상 면접관은 쓰지 않지만
  // 답변 입력 훅(useInterviewAnswer)이 아직 setter 를 받으므로 남겨 둔다.
  const [, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const {
    emotion: interviewerEmotion,
    reactionKey,
    setEmotion: setInterviewerEmotion
  } = useInterviewerReaction();
  const settingsModal = useModal();
  const exitModal = useModal();
  // 면접 중에도 켜고 끌 수 있는 옵션(답변 시간 제한 / 답변 수정 금지)
  const { settings, toggleSetting } = useInterviewSettings();
  const media = useRoomMedia();
  const { interviewerId, selectInterviewer } = useSelectedInterviewer();
  const queryClient = useQueryClient();

  // 라이브 코딩 여부: URL 쿼리(즉시 분기용) ⇨ 서버 응답으로 보강
  const isLiveCoding = isLiveCodingFromUrl || data.include_live_coding;
  const isFinished = data.interview_state === "FINISHED";
  const audioUrl = isVoiceInterview(data) ? data.cur_question_voice_url : "";

  const { playAudio, playFinished } = useAudio(audioUrl, {
    onPlayEnd: () => {
      setIsSpeaking(false);
      if (mode === "VOICE") {
        publishInterviewEvent("interview:startVoiceRecognition");
      }
    },
    onPlayStart: () => setIsSpeaking(true)
  });

  useInterviewEvent("interview:voiceRecognitionStarted", () =>
    setIsListening(true)
  );
  useInterviewEvent("interview:voiceRecognitionStopped", () =>
    setIsListening(false)
  );

  const updateInterviewData = useCallback(
    (updates: Partial<Interview>): void => {
      queryClient.setQueryData(
        interviewKeys.byInterviewId(interviewId),
        (oldData: Interview) => (oldData ? { ...oldData, ...updates } : oldData)
      );
    },
    [queryClient, interviewId]
  );

  const curQuestion = isTextInterview(data)
    ? data.cur_question
    : data.cur_question_voice_url;

  const answer = useInterviewAnswer({
    isInterviewStarted: isJoined && !isLiveCoding,
    cur_question: curQuestion,
    cur_question_id: data.cur_question_id,
    prev_questions_and_answers: data.prev_questions_and_answers,
    updateInterviewData,
    interviewId,
    setIsListening,
    setInterviewerEmotion,
    playAudio,
    mode,
    isFinished,
    isInterviewerSpeaking: isSpeaking,
    isTimeLimitEnabled: settings.isTimeLimitEnabled,
    isAppendOnlyEnabled: settings.isAppendOnlyEnabled
  });

  const liveCoding = useLiveCodingAnswer({
    interviewId,
    isInterviewStarted: isJoined && isLiveCoding,
    isFinished,
    cur_question: curQuestion,
    cur_question_id: data.cur_question_id,
    prev_questions_and_answers: data.prev_questions_and_answers,
    updateInterviewData,
    setInterviewerEmotion,
    playAudio
  });

  // CODE 면접의 원본 문제(첫 root question)를 한 번만 캡처한다
  const [originalProblem, setOriginalProblem] = useState<string>("");
  useEffect(() => {
    if (!isLiveCoding || originalProblem) return;
    if (data.prev_questions_and_answers.length > 0) return;
    if (!isTextInterview(data)) return;
    setOriginalProblem(data.cur_question);
  }, [isLiveCoding, originalProblem, data]);

  const handleJoin = (): void => {
    setIsJoined(true);
    // 재생 실패(자동재생 차단 등)는 면접 진행을 막지 않는다
    playAudio().catch(() => {});
  };

  const title = `${categoryTitle ?? ""} 모의면접`.trim();
  const subtitle = isLiveCoding ? "라이브 코딩" : MODE_LABELS[mode];
  const answeredCount = data.prev_questions_and_answers.length;
  const currentNumber = isFinished
    ? answeredCount
    : Math.min(answeredCount + 1, data.max_question_count);

  // 이미 끝난 면접은 입장 화면 없이 바로 종료 dialog 를 띄운다
  if (!isJoined && !isFinished) {
    return (
      <>
      <InterviewLobbyScreen
        title={title}
        details={[
          `${subtitle} · 질문 ${data.max_question_count}개`,
          answeredCount > 0
            ? `${currentNumber}번째 질문부터 이어서 진행해요.`
            : "입장하면 첫 질문이 시작돼요."
        ]}
        media={media}
        interviewerId={interviewerId}
        onSelectInterviewer={selectInterviewer}
        onOpenSettings={isLiveCoding ? undefined : settingsModal.openModal}
        onJoin={handleJoin}
      />
      <InterviewSettingsModal
        isOpen={settingsModal.isOpen}
        onClose={settingsModal.closeModal}
        settings={settings}
        onToggle={toggleSetting}
      />
      </>
    );
  }

  const micAction: InterviewControlAction | undefined =
    mode === "VOICE" && !isLiveCoding
      ? {
          id: "mic",
          label: answer.isVoiceListening ? "녹음 멈추기" : "녹음 시작",
          icon: answer.isVoiceListening ? <MicIcon /> : <MicOffIcon />,
          pressed: answer.isVoiceListening,
          disabled: answer.isPending || isFinished || isSpeaking,
          onClick: answer.isVoiceListening
            ? answer.stopVoiceInput
            : answer.startVoiceInput
        }
      : undefined;

  const voiceInputAction: InterviewControlAction[] =
    mode === "TEXT" && !isLiveCoding
      ? [
          {
            id: "voice-input",
            label: answer.isVoiceListening ? "음성 입력 멈추기" : "음성으로 말하기",
            pressed: answer.isVoiceListening,
            disabled: answer.isPending || isFinished,
            onClick: answer.isVoiceListening
              ? answer.stopVoiceInput
              : answer.startVoiceInput
          }
        ]
      : [];

  const actions = media.buildActions({
    onOpenSettings: isLiveCoding ? undefined : settingsModal.openModal,
    onExit: exitModal.openModal,
    micAction,
    extraActions: voiceInputAction
  });

  const primaryAction = isHistoryOpen || isFinished ? undefined : isLiveCoding ? (
    <LiveCodingSubmitButton answer={liveCoding} />
  ) : (
    <AnswerSubmitButton
      answer={answer}
      label={mode === "VOICE" ? "답변 완료 및 제출" : "답변 제출"}
    />
  );

  const history = (
    <AnswerHistoryPanel
      items={data.prev_questions_and_answers}
      onBack={() => setIsHistoryOpen(false)}
      parseCode={isLiveCoding}
    />
  );

  const workspace = (() => {
    if (isLiveCoding) {
      if (isHistoryOpen) return history;
      const isFollowUp = answeredCount > 0 && curQuestion !== originalProblem;
      return (
        <>
          <div className="mb-3 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="default"
              onClick={() => setIsHistoryOpen(true)}
              className="bg-bg-base"
            >
              면접 답변 기록
            </Button>
          </div>
          <LiveCodingWorkspace
            answer={liveCoding}
            problemMarkdown={
              isFollowUp
                ? `${originalProblem}\n\n---\n\n### 면접관의 추가 질문\n\n${curQuestion}`
                : originalProblem || curQuestion
            }
          />
        </>
      );
    }
    if (mode === "VOICE") {
      return (
        <>
          <CurrentQuestion number={currentNumber} variant="bar">
            {/* 음성 면접은 서버가 질문 텍스트를 주지 않아 다시 듣기만 제공한다 */}
            <span className="flex flex-wrap items-center gap-3 text-base font-semibold md:text-lg">
              {isFinished
                ? "면접이 종료되었습니다. 고생하셨습니다."
                : isSpeaking
                  ? "면접관이 질문하고 있어요"
                  : playFinished
                    ? "질문 재생이 끝났어요. 답변해 주세요."
                    : "면접관의 질문을 들어 주세요."}
              {!isFinished && (
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  aria-label="질문 다시 듣기"
                  disabled={isSpeaking}
                  onClick={() => {
                    playAudio().catch(() => {});
                  }}
                  prefixIcon={<VolumeOnIcon />}
                >
                  다시 듣기
                </Button>
              )}
            </span>
          </CurrentQuestion>
          <div className="flex flex-col gap-2 md:flex-row md:items-start">
            <div className="min-w-0 flex-1">
              <AnswerTextarea answer={answer} compact />
            </div>
            <RecordingIndicator
              isRecording={answer.isVoiceListening}
              className="self-end md:self-start"
            />
          </div>
          <AnswerNotices answer={answer} />
        </>
      );
    }
    if (isHistoryOpen) return history;
    return (
      <TextAnswerWorkspace
        questionNumber={currentNumber}
        question={
          isFinished ? "면접이 종료되었습니다. 고생하셨습니다." : getCurrentQuestion(data)
        }
        draftStatus={
          answer.hasAnswer && !isFinished
            ? answer.isDraftSaved
              ? "초안 자동 저장됨"
              : "저장하는 중..."
            : undefined
        }
        onOpenHistory={() => setIsHistoryOpen(true)}
        notice={<AnswerNotices answer={answer} />}
      >
        <AnswerTextarea answer={answer} />
      </TextAnswerWorkspace>
    );
  })();

  return (
    <>
      <InterviewRoomLayout
        variant={isLiveCoding ? "stage" : mode === "VOICE" ? "focus" : "split"}
        banner={
          data.is_demo ? (
            <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
              <span className="text-xs font-medium text-amber-800">
                데모 면접입니다. 로그인하면 더 많은 기능을 이용할 수 있어요.
              </span>
            </div>
          ) : undefined
        }
        header={
          <InterviewRoomHeader
            title={title}
            subtitle={subtitle}
            current={currentNumber}
            total={data.max_question_count}
          />
        }
        interviewerTile={
          <InterviewerTile
            interviewerId={interviewerId}
            emotion={interviewerEmotion}
            reactionKey={reactionKey}
            isSpeaking={isSpeaking}
          />
        }
        selfTile={<SelfCameraTile media={media} showStatus={mode === "VOICE" && !isLiveCoding} />}
        workspace={workspace}
        controls={<InterviewControlBar actions={actions} primaryAction={primaryAction} />}
      />
      <InterviewSettingsModal
        isOpen={settingsModal.isOpen}
        onClose={settingsModal.closeModal}
        settings={settings}
        onToggle={toggleSetting}
      />
      <InterviewExitModal isOpen={exitModal.isOpen} onClose={exitModal.closeModal} />
      <InterviewFinishModal
        interviewState={data.interview_state}
        interviewId={interviewId}
      />
    </>
  );
}
