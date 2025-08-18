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
      audioRef.current.pause(); // 오디오 일시정지 추가
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
      if (audioRef.current) {
        audioRef.current.pause(); // 오디오 일시정지 추가
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.removeEventListener("error", handleError);
        audioRef.current.removeEventListener(
          "canplaythrough",
          handleCanPlayThrough
        );
        audioRef.current.removeEventListener("loadstart", handleLoadStart);
        audioRef.current.removeEventListener("play", handlePlay);
        audioRef.current.remove();
        audioRef.current = null;
      }
    };
  }, []); // 의존성 배열 수정

  const afterLoad = () => {
    loadingRef.current = false;
    readyRef.current = true;
    audioRef.current.play().catch((err) => {
      console.error(err);
    });
  };

  const playAudio = useCallback(
    async (audioUrl?: string) => {
      if (!audioRef.current) {
        throw new Error("Audio element not available");
      }
      if (!audioUrl && audioRef.current.src) {
        return audioRef.current.play();
      }
      audioRef.current.addEventListener("loadeddata", afterLoad, {
        once: true
      });

      audioRef.current.src = audioUrl;
      audioRef.current.load();
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
