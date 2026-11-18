import {
  getInterviewerPosterUrl,
  INTERVIEWERS,
  InterviewerId,
  isInterviewerId
} from "@/domains/interview/interviewers";
import { Button, CameraIcon, SettingIcon } from "@kokomen/ui";
import { InterviewerPicker, InterviewLobby } from "@kokomen/ui/domains";
import { JSX } from "react";
import { SelfCameraTile } from "./roomTiles";
import type { RoomMedia } from "./useRoomMedia";

const PICKER_OPTIONS = INTERVIEWERS.map((interviewer) => ({
  id: interviewer.id,
  name: interviewer.name,
  posterUrl: getInterviewerPosterUrl(interviewer.id)
}));

/**
 * 면접 입장 전 화면. 카메라를 미리 켜 보고, 면접관과 면접 설정을 고른 뒤 "면접 입장하기"로 들어간다.
 *
 * 입장 버튼은 사용자 동작이라, 음성 면접의 첫 질문 재생(브라우저 자동재생 제한)도
 * 이 버튼을 누를 때 시작한다.
 */
export function InterviewLobbyScreen({
  title,
  details,
  media,
  interviewerId,
  onSelectInterviewer,
  onOpenSettings,
  onJoin,
  isJoinDisabled = false
}: {
  title: string;
  details: string[];
  media: RoomMedia;
  interviewerId: InterviewerId;
  // eslint-disable-next-line no-unused-vars
  onSelectInterviewer: (id: InterviewerId) => void;
  /** 면접 설정(답변 시간 제한 등)이 있는 면접만 넘긴다 */
  onOpenSettings?: () => void;
  onJoin: () => void;
  isJoinDisabled?: boolean;
}): JSX.Element {
  const { camera, toggleCamera } = media;
  return (
    <InterviewLobby
      title={title}
      details={details}
      preview={<SelfCameraTile media={media} />}
      deviceControls={
        <>
          <Button
            type="button"
            variant="secondary"
            size="large"
            aria-pressed={camera.isOn}
            disabled={camera.isStarting}
            onClick={() => {
              toggleCamera();
            }}
            prefixIcon={<CameraIcon />}
          >
            {camera.isOn ? "카메라 끄기" : "카메라 켜기"}
          </Button>
          {onOpenSettings && (
            <Button
              type="button"
              variant="secondary"
              size="large"
              onClick={onOpenSettings}
              prefixIcon={<SettingIcon />}
            >
              면접 설정
            </Button>
          )}
        </>
      }
      options={
        <InterviewerPicker
          options={PICKER_OPTIONS}
          selectedId={interviewerId}
          onSelect={(id) => {
            if (isInterviewerId(id)) onSelectInterviewer(id);
          }}
        />
      }
      notice={
        <p className="text-sm text-text-tertiary">
          카메라는 선택 사항이에요. 영상은 이 브라우저에서 표정 분석에만 쓰이고 저장하거나
          전송하지 않아요.
        </p>
      }
      onJoin={onJoin}
      isJoinDisabled={isJoinDisabled}
    />
  );
}
