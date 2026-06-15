import React, { JSX } from "react";
import { Camera, CameraOff, Loader2 } from "lucide-react";
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

  return (
    <div className="absolute bottom-4 right-4 z-30 flex flex-col items-end">
      {isCameraOn && (
        <div className="relative w-[200px] h-[150px] rounded-lg overflow-hidden border-2 border-white/50 shadow-lg bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
            muted
            playsInline
          />
          {isModelLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
          {!isModelLoading && currentExpression && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-xs text-white">
              {EXPRESSION_LABELS[currentExpression] || currentExpression}
            </div>
          )}
          {!isModelLoading && !currentExpression && isCameraOn && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-xs text-white">
              얼굴을 인식하는 중...
            </div>
          )}
        </div>
      )}
      <div className="relative mt-2">
        {!isCameraOn && enabled && !isModelLoading && (
          <div
            role="tooltip"
            className="absolute bottom-full right-0 mb-2 px-3 py-2 text-sm font-medium text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap animate-bounce pointer-events-none"
          >
            표정 인식을 활성화 해보세요
            <div className="absolute top-full right-4 w-0 h-0 border-4 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800" />
          </div>
        )}
        <button
          onClick={toggleCamera}
          disabled={!enabled || isModelLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            isCameraOn
              ? "bg-white/90 border-gray-200 text-gray-700 hover:bg-white"
              : "bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100 animate-pulse"
          }`}
        >
          {isCameraOn ? (
            <>
              <CameraOff className="w-4 h-4" />
              카메라 끄기
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              표정 인식
            </>
          )}
        </button>
      </div>
    </div>
  );
}
