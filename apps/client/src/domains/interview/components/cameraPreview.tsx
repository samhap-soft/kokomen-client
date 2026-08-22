import React, { JSX, useState } from "react";
import { Camera, CameraOff, Loader2, X } from "lucide-react";
import { useFacialExpressionAnalysis } from "../hooks/useFacialExpressionAnalysis";

interface CameraPreviewProps {
  enabled: boolean;
}

const EXPRESSION_LABELS: Record<string, string> = {
  neutral: "보통",
  happy: "좋음",
  sad: "우울",
  angry: "화남",
  fearful: "긴장",
  disgusted: "불쾌",
  surprised: "놀람"
};

export default function CameraPreview({
  enabled
}: CameraPreviewProps): JSX.Element {
  const {
    videoRef,
    isCameraOn,
    toggleCamera,
    isModelLoading,
    currentExpression
  } = useFacialExpressionAnalysis({ enabled });
  // 안내를 한 번 닫으면 이 면접 동안 다시 띄우지 않는다
  const [isHintDismissed, setIsHintDismissed] = useState<boolean>(false);

  const showHint = !isCameraOn && enabled && !isModelLoading && !isHintDismissed;

  return (
    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-30 flex flex-col items-end">
      {isCameraOn && (
        <div className="relative w-[120px] h-[90px] sm:w-[200px] sm:h-[150px] rounded-lg overflow-hidden border-2 border-white/50 shadow-lg bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
            muted
            playsInline
          />
          {isModelLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
          {!isModelLoading && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-xs text-white">
              {currentExpression
                ? EXPRESSION_LABELS[currentExpression] || currentExpression
                : "얼굴을 인식하는 중..."}
            </div>
          )}
        </div>
      )}
      <div className="relative mt-2">
        {showHint && (
          <div
            role="tooltip"
            className="absolute bottom-full right-0 mb-2 flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap"
          >
            표정 인식을 활성화 해보세요
            <button
              type="button"
              onClick={() => setIsHintDismissed(true)}
              aria-label="표정 인식 안내 닫기"
              className="rounded p-0.5 hover:bg-white/20"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <div className="absolute top-full right-4 w-0 h-0 border-4 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800" />
          </div>
        )}
        <button
          type="button"
          onClick={toggleCamera}
          disabled={!enabled || isModelLoading}
          aria-pressed={isCameraOn}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border shadow-sm text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            isCameraOn
              ? "bg-white/90 border-gray-200 text-gray-700 hover:bg-white"
              : "bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
          }`}
        >
          {isCameraOn ? (
            <>
              <CameraOff className="w-4 h-4" aria-hidden="true" />
              카메라 끄기
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" aria-hidden="true" />
              표정 인식
            </>
          )}
        </button>
      </div>
    </div>
  );
}
