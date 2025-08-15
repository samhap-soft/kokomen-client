import { useEffect, useRef, useState, useCallback } from "react";

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
  const loadingRef = useRef<boolean>(false);
  const readyRef = useRef<boolean>(false);

  // audio 요소를 동적으로 생성하고 관리
  useEffect(() => {
    // 기존 audio 요소가 있다면 제거
    if (audioRef.current) {
      audioRef.current.remove();
    }

    // 새로운 audio 요소 생성
    const audio = document.createElement("audio");
    audio.preload = "auto";
    audio.src = audioUrl;
    audioRef.current = audio;

    const handleError = () => {
      loadingRef.current = false;
      readyRef.current = false;
      onPlayError?.();
    };

    // 이벤트 리스너 추가
    const handleEnded = () => {
      setPlayFinished(true);
      onPlayEnd?.();
    };

    const handleCanPlayThrough = () => {
      loadingRef.current = false;
      readyRef.current = true;
    };

    const handleLoadStart = () => {
      loadingRef.current = true;
      readyRef.current = false;
    };

    const handlePlay = () => {
      setPlayFinished(false);
      onPlayStart?.();
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("play", handlePlay);

    // cleanup 함수
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("play", handlePlay);
      audio.remove();
      audioRef.current = null;
    };
  }, []);

  const playAudio = useCallback(
    async (audioUrl?: string) => {
      if (!audioRef.current) {
        throw new Error("Audio element not available");
      }
      if (!audioUrl) {
        return audioRef.current.play();
      }

      audioRef.current.src = audioUrl;
      audioRef.current.addEventListener("loadeddata", () => {
        loadingRef.current = false;
        readyRef.current = true;
        audioRef.current.play().catch((err) => {
          console.error(err);
        });
      });
    },
    [onPlayStart]
  );

  const stopAudio = useCallback((): void => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resetAudio = useCallback((): void => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, []);

  return {
    playAudio,
    stopAudio,
    resetAudio,
    audioRef,
    playFinished,
    loadingRef,
    readyRef
  };
}

export { useAudio };
