import { useCallback, useEffect, useRef, useState } from "react";

export type CameraError = "denied" | "unavailable";

export type CameraStream = {
  /** 카메라를 보여줄 video 에 붙인다. 타일이 다시 마운트돼도 스트림을 다시 연결한다 */
  // eslint-disable-next-line no-unused-vars
  videoRef: (element: HTMLVideoElement | null) => void;
  /** 표정 분석처럼 프레임을 읽어야 하는 곳에서 쓴다 */
  videoElement: HTMLVideoElement | null;
  isOn: boolean;
  isStarting: boolean;
  error: CameraError | null;
  /** 켜지면 null, 실패하면 이유를 돌려준다 */
  start: () => Promise<CameraError | null>;
  stop: () => void;
  toggle: () => Promise<void>;
};

/**
 * 내 카메라 스트림. 입장 전 화면과 면접실이 같은 스트림을 쓴다.
 *
 * 영상은 브라우저 안에서만 쓰고 서버로 보내지 않는다.
 * 컴포넌트가 사라지면 트랙을 모두 멈춰 카메라 표시등을 끈다.
 */
export function useCameraStream(): CameraStream {
  const streamRef = useRef<MediaStream | null>(null);
  // 권한 창이 떠 있는 동안 화면을 떠나면, 늦게 도착한 스트림을 바로 멈춰야 카메라 표시등이 꺼진다
  const isMountedRef = useRef<boolean>(true);
  // 카메라 버튼과 표정 분석 버튼을 연달아 누르면 스트림이 두 개 열리지 않도록 진행 중인 요청을 같이 쓴다
  const pendingRef = useRef<Promise<CameraError | null> | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );
  const [isOn, setIsOn] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [error, setError] = useState<CameraError | null>(null);

  const attach = useCallback((element: HTMLVideoElement | null) => {
    if (!element || !streamRef.current) return;
    if (element.srcObject !== streamRef.current) {
      element.srcObject = streamRef.current;
    }
    element.play().catch(() => {});
  }, []);

  const videoRef = useCallback(
    (element: HTMLVideoElement | null) => {
      setVideoElement(element);
      attach(element);
    },
    [attach]
  );

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsOn(false);
  }, []);

  const start = useCallback((): Promise<CameraError | null> => {
    if (streamRef.current) return Promise.resolve(null);
    if (pendingRef.current) return pendingRef.current;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("unavailable");
      return Promise.resolve("unavailable");
    }
    setIsStarting(true);
    const request = navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false
      })
      .then((stream): CameraError | null => {
        if (!isMountedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return null;
        }
        streamRef.current = stream;
        setError(null);
        setIsOn(true);
        return null;
      })
      .catch((cause: unknown): CameraError => {
        const isDenied =
          cause instanceof DOMException && cause.name === "NotAllowedError";
        const reason: CameraError = isDenied ? "denied" : "unavailable";
        if (isMountedRef.current) setError(reason);
        return reason;
      })
      .finally(() => {
        pendingRef.current = null;
        if (isMountedRef.current) setIsStarting(false);
      });
    pendingRef.current = request;
    return request;
  }, []);

  const toggle = useCallback(async () => {
    if (streamRef.current) {
      stop();
      return;
    }
    await start();
  }, [start, stop]);

  // 스트림이 켜진 뒤 이미 마운트된 video 에도 연결한다
  useEffect(() => {
    if (isOn) attach(videoElement);
  }, [isOn, videoElement, attach]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stop();
    };
  }, [stop]);

  return { videoRef, videoElement, isOn, isStarting, error, start, stop, toggle };
}
