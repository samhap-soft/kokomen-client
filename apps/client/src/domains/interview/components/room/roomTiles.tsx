import type { InterviewerEmotion } from "@kokomen/types";
import { InterviewerVideo, VideoTile } from "@kokomen/ui/domains";
import { JSX, useState } from "react";
import {
  DEFAULT_INTERVIEWER_ID,
  getInterviewerClipUrls,
  getInterviewerPosterUrl,
  InterviewerId
} from "@/domains/interview/interviewers";
import type { RoomMedia } from "./useRoomMedia";

const EXPRESSION_LABELS: Record<string, string> = {
  neutral: "보통",
  happy: "좋음",
  sad: "우울",
  angry: "화남",
  fearful: "긴장",
  disgusted: "불쾌",
  surprised: "놀람"
};

/** "AI 면접관" 타일. 면접관이 말하는 동안 테두리를 강조한다. */
export function InterviewerTile({
  emotion,
  reactionKey,
  isSpeaking,
  interviewerId = DEFAULT_INTERVIEWER_ID
}: {
  emotion: InterviewerEmotion;
  /** 답변을 제출할 때마다 바뀌는 값. 이 값이 바뀌면 면접관이 반응한다 */
  reactionKey: number;
  isSpeaking: boolean;
  interviewerId?: InterviewerId;
}): JSX.Element {
  const [isVideoFailed, setIsVideoFailed] = useState<boolean>(false);
  const [isPosterFailed, setIsPosterFailed] = useState<boolean>(false);

  // 영상을 불러오지 못하면 같은 면접관의 정지 사진을 보여주고, 사진도 없으면 안내 문구만 둔다.
  // 면접 진행에는 영향이 없다.
  return (
    <VideoTile
      label="AI 면접관"
      isActive={isSpeaking}
      placeholder={
        <span role="status" className="p-2 pb-8 text-center text-xs md:text-sm">
          면접관 화면을 불러오지 못했어요
        </span>
      }
    >
      {!isVideoFailed ? (
        <InterviewerVideo
          interviewerId={interviewerId}
          clipUrls={getInterviewerClipUrls(interviewerId)}
          posterUrl={getInterviewerPosterUrl(interviewerId)}
          emotion={emotion}
          reactionKey={reactionKey}
          isSpeaking={isSpeaking}
          onError={() => setIsVideoFailed(true)}
        />
      ) : !isPosterFailed ? (
        <img
          src={getInterviewerPosterUrl(interviewerId)}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setIsPosterFailed(true)}
        />
      ) : undefined}
    </VideoTile>
  );
}

/**
 * "내 카메라" 타일. 카메라가 꺼져 있으면 안내 문구를, 표정 분석 중이면 지금 표정을 보여준다.
 * 거울처럼 보이도록 좌우를 뒤집는다.
 */
export function SelfCameraTile({
  media,
  showStatus = false
}: {
  media: RoomMedia;
  /** 음성 면접처럼 내 카메라가 크게 보일 때 "나 · 카메라 켜짐" 상태를 표시한다 */
  showStatus?: boolean;
}): JSX.Element {
  const { camera, isExpressionOn, expression } = media;
  const expressionLabel = isExpressionOn
    ? expression.isModelLoading
      ? "표정 분석 준비 중..."
      : expression.currentExpression
        ? `표정: ${EXPRESSION_LABELS[expression.currentExpression] ?? expression.currentExpression}`
        : "얼굴을 찾는 중..."
    : null;

  return (
    <VideoTile
      label={showStatus ? undefined : "나"}
      status={
        showStatus
          ? `나 · 카메라 ${camera.isOn ? "켜짐" : "꺼짐"}`
          : undefined
      }
      placeholder={camera.isStarting ? "카메라를 켜는 중..." : "카메라가 꺼져 있어요"}
    >
      {camera.isOn ? (
        <>
          <video
            ref={camera.videoRef}
            className="h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
            muted
            playsInline
            aria-label="내 카메라 화면"
          />
          {expressionLabel && (
            <span className="absolute top-2 left-2 rounded-md bg-gray-10/80 px-2 py-1 text-xs text-text-light-solid">
              {expressionLabel}
            </span>
          )}
        </>
      ) : undefined}
    </VideoTile>
  );
}
