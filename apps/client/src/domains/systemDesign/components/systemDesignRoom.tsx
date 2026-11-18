import InterviewFinishModal from "@/domains/interview/components/interviewFinishModal";
import { useInterviewerReaction } from "@/domains/interview/hooks/useInterviewerReaction";
import { useSelectedInterviewer } from "@/domains/interview/hooks/useSelectedInterviewer";
import { InterviewExitModal } from "@/domains/interview/components/interviewExitModal";
import { InterviewNotFoundError } from "@/domains/interview/components/interviewNotFoundError";
import { InterviewLobbyScreen } from "@/domains/interview/components/room/interviewLobbyScreen";
import {
  InterviewerTile,
  SelfCameraTile
} from "@/domains/interview/components/room/roomTiles";
import { useRoomMedia } from "@/domains/interview/components/room/useRoomMedia";
import {
  clearAnswerDraft,
  readAnswerDraft,
  useAnswerDraft
} from "@/domains/interview/hooks/useAnswerDraft";
import { useInterviewDraftGuard } from "@/domains/interview/hooks/useInterviewDraftGuard";
import { getDifficultyLabel } from "@/domains/systemDesign/constants";
import { useSystemDesignInterview } from "@/domains/systemDesign/hooks/useSystemDesignInterview";
import { SystemDesignDiagram, SystemDesignInterview } from "@kokomen/types";
import { Badge, Button, LoadingFullScreen, Textarea } from "@kokomen/ui";
import {
  CurrentQuestion,
  InterviewControlBar,
  InterviewRoomHeader,
  InterviewRoomLayout
} from "@kokomen/ui/domains";
import {
  RequirementPanel,
  StageStepper,
  SystemDesignWorkspace
} from "@kokomen/ui/systemDesign";
import { getEmotion, useModal } from "@kokomen/utils";
import dynamic from "next/dynamic";
import { JSX, useCallback, useEffect, useRef, useState } from "react";

// React Flow 는 브라우저 크기를 재야 해서 서버에서 그리지 않는다
// eslint-disable-next-line @rushstack/typedef-var
const DiagramEditor = dynamic(
  () => import("@kokomen/ui/systemDesign").then((module) => module.DiagramEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-border bg-bg-base text-sm text-text-tertiary">
        다이어그램 에디터를 불러오는 중...
      </div>
    )
  }
);

/** 답변 최대 길이. 서버도 같은 값으로 검증해야 한다(API 초안). */
const ANSWER_MAX_LENGTH = 3000;

type SystemDesignDraft = {
  answer: string;
  diagram: SystemDesignDiagram;
};

const getProgressKey = (interview: SystemDesignInterview): string =>
  `${interview.stage}:${interview.cur_question_id ?? "requirements"}`;

export function SystemDesignInterviewRoom({
  interviewId
}: {
  interviewId: number;
}): JSX.Element {
  const controller = useSystemDesignInterview(interviewId);
  const { data, isPending, isError } = controller.query;

  if (isPending) return <LoadingFullScreen className="h-screen w-screen" />;
  if (isError) return <InterviewNotFoundError />;
  return (
    <SystemDesignRoomContent
      interviewId={interviewId}
      data={data}
      controller={controller}
    />
  );
}

function SystemDesignRoomContent({
  interviewId,
  data,
  controller
}: {
  interviewId: number;
  data: SystemDesignInterview;
  controller: ReturnType<typeof useSystemDesignInterview>;
}): JSX.Element {
  const { askMutation, completeMutation, submitMutation } = controller;
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const {
    emotion: interviewerEmotion,
    reactionKey,
    setEmotion: setInterviewerEmotion
  } = useInterviewerReaction();
  const media = useRoomMedia();
  const { interviewerId, selectInterviewer } = useSelectedInterviewer();
  const exitModal = useModal();

  const isFinished = data.interview_state === "FINISHED";
  const progressKey = getProgressKey(data);

  // 새로고침 전에 쓰던 초안이 같은 단계 · 질문이면 되살린다
  const [initialDraft] = useState<SystemDesignDraft | null>(() =>
    readAnswerDraft<SystemDesignDraft>(interviewId, progressKey)
  );
  const [answer, setAnswer] = useState<string>(initialDraft?.answer ?? "");
  // 캔버스는 단계가 바뀌어도 그대로 둔다. 제출할 때마다 그 시점의 다이어그램을 보낸다
  const [diagram, setDiagram] = useState<SystemDesignDiagram>(
    initialDraft?.diagram ?? data.diagram
  );
  const diagramRef = useRef<SystemDesignDiagram>(diagram);
  const handleDiagramChange = useCallback((next: SystemDesignDiagram) => {
    diagramRef.current = next;
    setDiagram(next);
  }, []);

  // 질문이 바뀌면 텍스트 답변만 비운다
  const lastProgressKeyRef = useRef<string>(progressKey);
  useEffect(() => {
    if (lastProgressKeyRef.current === progressKey) return;
    lastProgressKeyRef.current = progressKey;
    setAnswer("");
  }, [progressKey]);

  const hasAnswer = answer.trim().length > 0;
  const { isSaved: isDraftSaved } = useAnswerDraft<SystemDesignDraft>({
    interviewId,
    progressKey,
    value: { answer, diagram },
    isEmpty: !hasAnswer && diagram.blocks.length === 0,
    enabled: isJoined && !isFinished
  });
  useInterviewDraftGuard(hasAnswer && !isFinished);

  useEffect(() => {
    if (isFinished) clearAnswerDraft(interviewId);
  }, [isFinished, interviewId]);

  const isRequirements = data.stage === "REQUIREMENTS";
  const difficultyLabel = getDifficultyLabel(data.difficulty);
  const currentNumber = isFinished
    ? data.cur_question_count
    : isRequirements
      ? 0
      : data.cur_question_count + 1;

  if (!isJoined && !isFinished) {
    return (
      <InterviewLobbyScreen
        title="시스템 설계 모의면접"
        details={[
          `${data.topic.title}`,
          `텍스트 면접 · ${difficultyLabel} · 질문 최대 ${data.max_question_count}개`,
          "요구사항 확인 → 개략 설계 → 심화 순서로 진행해요."
        ]}
        media={media}
        interviewerId={interviewerId}
        onSelectInterviewer={selectInterviewer}
        onJoin={() => setIsJoined(true)}
      />
    );
  }

  const submitAnswer = (): void => {
    if (!hasAnswer || data.cur_question_id === null || submitMutation.isPending) {
      return;
    }
    submitMutation.mutate(
      {
        questionId: data.cur_question_id,
        question: data.cur_question ?? "",
        answer: answer.trim(),
        diagram: diagramRef.current
      },
      {
        onSuccess: (response) => {
          setAnswer("");
          setInterviewerEmotion(getEmotion(response.cur_answer_rank));
        }
      }
    );
  };

  const sidePanel = isRequirements ? (
    <RequirementPanel
      items={data.requirement_questions}
      maxCount={data.max_requirement_question_count}
      onAsk={(question) => askMutation.mutate(question)}
      onComplete={() => completeMutation.mutate()}
      isAsking={askMutation.isPending}
      isCompleting={completeMutation.isPending}
      disabled={isFinished}
    />
  ) : (
    <div className="flex flex-1 flex-col gap-3 lg:min-h-0">
      <CurrentQuestion number={Math.max(currentNumber, 1)}>
        <span className="text-base md:text-lg">
          {isFinished
            ? "면접이 종료되었습니다. 고생하셨습니다."
            : data.cur_question}
        </span>
      </CurrentQuestion>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-text-primary">나의 답변</h3>
        {isDraftSaved && (
          <span aria-live="polite" className="text-sm text-text-secondary">
            초안 자동 저장됨
          </span>
        )}
      </div>
      <Textarea
        name="system-design-answer"
        aria-label="system-design-answer"
        value={answer}
        maxLength={ANSWER_MAX_LENGTH}
        onChange={(event) => setAnswer(event.target.value)}
        disabled={isFinished || submitMutation.isPending}
        placeholder="설계 의도와 선택한 이유를 적어 주세요. 제출하면 지금 그린 다이어그램도 함께 보내요."
        className="min-h-[160px] w-full flex-1 resize-none lg:min-h-28"
      />
    </div>
  );

  const actions = media.buildActions({ onExit: exitModal.openModal });

  return (
    <>
      <InterviewRoomLayout
        variant="stage"
        header={
          <InterviewRoomHeader
            title="시스템 설계 모의면접"
            subtitle={`텍스트 면접 · ${difficultyLabel}`}
            current={currentNumber}
            total={data.max_question_count}
          />
        }
        interviewerTile={
          <InterviewerTile
            interviewerId={interviewerId}
            emotion={interviewerEmotion}
            reactionKey={reactionKey}
            isSpeaking={false}
          />
        }
        selfTile={<SelfCameraTile media={media} />}
        workspace={
          <SystemDesignWorkspace
            topic={data.topic}
            topicMeta={
              <Badge appearance="weak" type="brand">
                {difficultyLabel}
              </Badge>
            }
            stepper={<StageStepper current={data.stage} isFinished={isFinished} />}
            sidePanel={sidePanel}
            editor={
              <DiagramEditor
                key={interviewId}
                defaultValue={diagram}
                onChange={handleDiagramChange}
                disabled={isFinished}
              />
            }
          />
        }
        controls={
          <InterviewControlBar
            actions={actions}
            primaryAction={
              isRequirements || isFinished ? undefined : (
                <Button
                  type="button"
                  variant="primary"
                  size="large"
                  onClick={submitAnswer}
                  disabled={!hasAnswer || submitMutation.isPending}
                  pendingSpinner={submitMutation.isPending}
                  pendingText="제출 중.."
                  className="min-w-32 md:min-w-48"
                >
                  설계 제출
                </Button>
              )
            }
          />
        }
      />
      <InterviewExitModal isOpen={exitModal.isOpen} onClose={exitModal.closeModal} />
      <InterviewFinishModal
        interviewState={data.interview_state}
        interviewId={interviewId}
        resultPath={`/interviews/${interviewId}/system-design-report`}
      />
    </>
  );
}
