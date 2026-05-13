import React from "react";
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

export default function CameraPreview({ enabled }: CameraPreviewProps) {
  const {
    videoRef,
    isCameraOn,
    toggleCamera,
    isModelLoading,
    currentExpression
  } = useFacialExpressionAnalysis({ enabled });

  return (
    <div className="absolute bottom-4 left-4 z-30">
      {isCameraOn && (
        <div className="relative w-[160px] h-[120px] rounded-lg overflow-hidden border-2 border-white/50 shadow-lg bg-black">
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
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white">
              {EXPRESSION_LABELS[currentExpression] || currentExpression}
            </div>
          )}
          {!isModelLoading && !currentExpression && isCameraOn && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white">
              얼굴을 인식하는 중...
            </div>
          )}
        </div>
      )}
      <button
        onClick={toggleCamera}
        disabled={!enabled || isModelLoading}
        className={`mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          isCameraOn
            ? "bg-white/90 border-gray-200 text-gray-700 hover:bg-white"
            : "bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100 animate-pulse"
        }`}
      >
        {isCameraOn ? (
          <>
            <CameraOff className="w-3.5 h-3.5" />
            카메라 끄기
          </>
        ) : (
          <>
            <Camera className="w-3.5 h-3.5" />
            표정 인식
          </>
        )}
      </button>
    </div>
  );
}
