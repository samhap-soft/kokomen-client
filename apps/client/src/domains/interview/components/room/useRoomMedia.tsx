import {
  CameraError,
  useCameraStream
} from "@/domains/interview/hooks/useCameraStream";
import { useFacialExpressionAnalysis } from "@/domains/interview/hooks/useFacialExpressionAnalysis";
import { CameraIcon, SettingIcon, useToast } from "@kokomen/ui";
import type { InterviewControlAction } from "@kokomen/ui/domains";
import { useCallback, useState } from "react";

const CAMERA_ERROR_MESSAGES: Record<CameraError, string> = {
  denied: "브라우저 설정에서 카메라 권한을 허용해 주세요.",
  unavailable: "카메라를 찾지 못했어요. 연결 상태를 확인해 주세요."
};

/**
 * 면접실의 카메라 · 표정 분석 상태와, 조작 바에 공통으로 들어가는 버튼.
 * 기본 면접과 시스템 설계 면접이 같이 쓴다.
 */
export function useRoomMedia() {
  const camera = useCameraStream();
  const [isExpressionOn, setIsExpressionOn] = useState<boolean>(false);
  const { warning: warningToast } = useToast();
  const expression = useFacialExpressionAnalysis({
    enabled: isExpressionOn,
    videoElement: camera.videoElement,
    isCameraOn: camera.isOn
  });

  const notifyCameraError = useCallback(
    (error: CameraError | null) => {
      if (!error) return;
      warningToast({
        title: "카메라를 켤 수 없어요",
        description: CAMERA_ERROR_MESSAGES[error],
        duration: 4000,
        position: "top-center"
      });
    },
    [warningToast]
  );

  const toggleCamera = useCallback(async () => {
    if (camera.isOn) {
      camera.stop();
      setIsExpressionOn(false);
      return;
    }
    notifyCameraError(await camera.start());
  }, [camera, notifyCameraError]);

  // 표정 분석은 카메라 프레임이 필요하므로, 켜면 카메라도 같이 켠다
  const toggleExpression = useCallback(async () => {
    if (isExpressionOn) {
      setIsExpressionOn(false);
      return;
    }
    const error = camera.isOn ? null : await camera.start();
    if (error) {
      notifyCameraError(error);
      return;
    }
    setIsExpressionOn(true);
  }, [camera, isExpressionOn, notifyCameraError]);

  const buildActions = useCallback(
    ({
      onOpenSettings,
      onExit,
      micAction,
      extraActions = []
    }: {
      onOpenSettings?: () => void;
      onExit: () => void;
      micAction?: InterviewControlAction;
      extraActions?: InterviewControlAction[];
    }): InterviewControlAction[] => [
      ...(onOpenSettings
        ? [
            {
              id: "settings",
              label: "면접 설정 열기",
              icon: <SettingIcon />,
              onClick: onOpenSettings
            }
          ]
        : []),
      ...(micAction ? [micAction] : []),
      {
        id: "camera",
        label: camera.isOn ? "카메라 끄기" : "카메라 켜기",
        icon: <CameraIcon />,
        pressed: camera.isOn,
        disabled: camera.isStarting,
        onClick: () => {
          toggleCamera();
        }
      },
      {
        id: "expression",
        label: isExpressionOn ? "표정 분석 끄기" : "표정 분석 켜기",
        pressed: isExpressionOn,
        disabled: expression.isModelLoading || camera.isStarting,
        onClick: () => {
          toggleExpression();
        }
      },
      ...extraActions,
      { id: "exit", label: "면접 중도 종료", onClick: onExit }
    ],
    [
      camera.isOn,
      camera.isStarting,
      isExpressionOn,
      expression.isModelLoading,
      toggleCamera,
      toggleExpression
    ]
  );

  return {
    camera,
    toggleCamera,
    isExpressionOn,
    expression,
    buildActions
  };
}

export type RoomMedia = ReturnType<typeof useRoomMedia>;
