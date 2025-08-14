import { useEffect, useRef, useState } from "react";

interface UseAudioOptions {
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onPlayError?: () => void;
}
function useAudio(
  audioUrl: string,
  { onPlayStart, onPlayEnd, onPlayError }: UseAudioOptions
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playFinished, setPlayFinished] = useState<boolean>(false);

  // audio 요소를 동적으로 생성하고 관리
  useEffect(() => {
    // 기존 audio 요소가 있다면 제거
    if (audioRef.current) {
      audioRef.current.remove();
    }

    // 새로운 audio 요소 생성
    const audio = document.createElement("audio");
    audio.preload = "auto";
    audioRef.current = audio;

    // 이벤트 리스너 추가
    const handleEnded = () => {
      setPlayFinished(true);
      onPlayEnd?.();
    };

    const handleError = () => {
      onPlayError?.();
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // cleanup 함수
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.remove();
      audioRef.current = null;
    };
  }, []);

  const playAudio = (): Promise<void> => {
    if (audioRef.current) {
      setPlayFinished(false);
      onPlayStart?.();
      return audioRef.current.play();
    }
    return Promise.reject(new Error("Audio element not available"));
  };

  const stopAudio = (): void => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resetAudio = (): void => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // audioUrl이 변경될 때마다 src 업데이트
  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;
    audioRef.current.src = audioUrl;
    audioRef.current.load();
  }, [audioUrl]);

  return {
    playAudio,
    stopAudio,
    resetAudio,
    audioRef,
    playFinished
  };
}
export { useAudio };
