import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@kokomen/ui";

type NegativeExpression = "angry" | "disgusted" | "fearful" | "sad";

const NEGATIVE_EXPRESSIONS: NegativeExpression[] = [
  "angry",
  "disgusted",
  "fearful",
  "sad"
];

const EXPRESSION_MESSAGES: Record<
  NegativeExpression,
  { title: string; description: string }
> = {
  angry: {
    title: "표정 관리 팁",
    description: "화난 표정이 감지되었어요. 깊게 숨을 쉬고 미소를 지어보세요 😊"
  },
  sad: {
    title: "표정 관리 팁",
    description:
      "우울한 표정이 감지되었어요. 자신감을 가지고 밝은 표정을 유지해보세요!"
  },
  disgusted: {
    title: "표정 관리 팁",
    description:
      "불쾌한 표정이 감지되었어요. 편안한 표정으로 면접에 임해보세요."
  },
  fearful: {
    title: "표정 관리 팁",
    description:
      "긴장된 표정이 감지되었어요. 천천히 호흡하면서 자연스럽게 대답해보세요."
  }
};

const NEUTRAL_THRESHOLD = 4;
const NEGATIVE_CONSECUTIVE_THRESHOLD = 4;
const NEUTRAL_COOLDOWN_MS = 30000;

interface UseFacialExpressionAnalysisOptions {
  enabled: boolean;
  analysisIntervalMs?: number;
  warningCooldownMs?: number;
  negativeThreshold?: number;
}

let modelsLoaded = false;

export function useFacialExpressionAnalysis({
  enabled,
  analysisIntervalMs = 1500,
  warningCooldownMs = 15000,
  negativeThreshold = 0.7
}: UseFacialExpressionAnalysisOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const faceApiRef = useRef<typeof import("face-api.js") | null>(null);
  // 이전 추론이 아직 끝나지 않았는지 표시한다
  const isAnalyzingRef = useRef<boolean>(false);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [currentExpression, setCurrentExpression] = useState<string | null>(
    null
  );

  const consecutiveNegativeRef = useRef(0);
  const consecutiveNeutralRef = useRef(0);
  const lastWarningTimeRef = useRef(0);
  const lastNeutralWarningTimeRef = useRef(0);
  const warningCountRef = useRef(0);
  const MAX_WARNINGS = 5;

  const { warning, info } = useToast();

  const loadModels = useCallback(async () => {
    if (modelsLoaded && faceApiRef.current) return;
    setIsModelLoading(true);
    try {
      const faceapi = await import("face-api.js");
      const MODEL_URL = "/models/face-api";
      // 표정만 쓰기 때문에 landmark 모델(수백 KB)은 불러오지 않는다
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      // eslint-disable-next-line require-atomic-updates
      faceApiRef.current = faceapi;
      // eslint-disable-next-line require-atomic-updates
      modelsLoaded = true;
    } catch (e) {
      console.error("face-api model load failed:", e);
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 160, height: 120, facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      console.error("Camera access failed:", e);
      setIsCameraOn(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const analyzeFrame = useCallback(async () => {
    const faceapi = faceApiRef.current;
    if (!faceapi || !videoRef.current) return;
    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
      )
      .withFaceExpressions();

    if (!detection) {
      setCurrentExpression(null);
      consecutiveNegativeRef.current = 0;
      return;
    }

    const expressions = detection.expressions;
    const sorted = Object.entries(expressions).sort(([, a], [, b]) => b - a);
    const [topExpression, topConfidence] = sorted[0];
    setCurrentExpression(topExpression);

    const isNegative =
      NEGATIVE_EXPRESSIONS.includes(topExpression as NegativeExpression) &&
      topConfidence >= negativeThreshold;

    if (isNegative) {
      consecutiveNegativeRef.current += 1;
      consecutiveNeutralRef.current = 0;
    } else if (topExpression === "neutral") {
      consecutiveNegativeRef.current = 0;
      consecutiveNeutralRef.current += 1;
    } else {
      consecutiveNegativeRef.current = 0;
      consecutiveNeutralRef.current = 0;
    }

    if (consecutiveNegativeRef.current >= NEGATIVE_CONSECUTIVE_THRESHOLD) {
      const now = Date.now();
      const timeSinceLastWarning = now - lastWarningTimeRef.current;

      if (
        timeSinceLastWarning >= warningCooldownMs &&
        warningCountRef.current < MAX_WARNINGS
      ) {
        const message =
          EXPRESSION_MESSAGES[topExpression as NegativeExpression];
        warning({
          title: message.title,
          description: message.description,
          duration: 5000,
          position: "top-left"
        });
        lastWarningTimeRef.current = now;
        warningCountRef.current += 1;
        consecutiveNegativeRef.current = 0;
      }
    }

    if (consecutiveNeutralRef.current >= NEUTRAL_THRESHOLD) {
      const now = Date.now();
      const timeSinceLastNeutralWarning =
        now - lastNeutralWarningTimeRef.current;

      if (timeSinceLastNeutralWarning >= NEUTRAL_COOLDOWN_MS) {
        info({
          title: "표정 팁",
          description:
            "면접 중 자연스러운 미소는 좋은 인상을 줄 수 있어요. 가볍게 웃어보세요 😊",
          duration: 5000,
          position: "top-left"
        });
        lastNeutralWarningTimeRef.current = now;
        consecutiveNeutralRef.current = 0;
      }
    }
  }, [negativeThreshold, warningCooldownMs, warning, info]);

  /**
   * 추론이 분석 간격보다 오래 걸리면 호출이 쌓여 3D 캔버스와 함께
   * 메인 스레드를 막는다. 앞선 추론이 끝나기 전에는 새로 시작하지 않는다.
   */
  const runAnalysis = useCallback(async () => {
    if (document.visibilityState === "hidden") return;
    if (isAnalyzingRef.current) return;

    isAnalyzingRef.current = true;
    try {
      await analyzeFrame();
    } catch (e) {
      console.error("facial expression analysis failed:", e);
    } finally {
      // 이 ref는 재진입을 막는 플래그일 뿐이고 이 함수만 쓴다.
      // 규칙이 경고하는 경합은 여기서는 일어나지 않는다.
      // eslint-disable-next-line require-atomic-updates
      isAnalyzingRef.current = false;
    }
  }, [analyzeFrame]);

  const startAnalysisLoop = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(runAnalysis, analysisIntervalMs);
  }, [runAnalysis, analysisIntervalMs]);

  const stopAnalysisLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggleCamera = useCallback(async () => {
    if (isCameraOn) {
      stopAnalysisLoop();
      stopCamera();
      setIsCameraOn(false);
      setCurrentExpression(null);
      consecutiveNegativeRef.current = 0;
      consecutiveNeutralRef.current = 0;
    } else {
      await loadModels();
      setIsCameraOn(true);
    }
  }, [isCameraOn, loadModels, stopCamera, stopAnalysisLoop]);

  useEffect(() => {
    if (isCameraOn && !streamRef.current) {
      startCamera().then(() => {
        startAnalysisLoop();
      });
    }
  }, [isCameraOn, startCamera, startAnalysisLoop]);

  useEffect(() => {
    if (!enabled && isCameraOn) {
      stopAnalysisLoop();
      stopCamera();
      setIsCameraOn(false);
      setCurrentExpression(null);
    }
  }, [enabled, isCameraOn, stopAnalysisLoop, stopCamera]);

  useEffect(() => {
    return () => {
      stopAnalysisLoop();
      stopCamera();
    };
  }, [stopAnalysisLoop, stopCamera]);

  return {
    videoRef,
    isCameraOn,
    toggleCamera,
    isModelLoading,
    currentExpression
  };
}
