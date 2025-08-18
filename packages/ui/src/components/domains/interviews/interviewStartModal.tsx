import { InterviewMode } from "@kokomen/types";
import { Button, Modal } from "@kokomen/ui";
import { useModal } from "@kokomen/utils";
import {
  Mic,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

interface InterviewStartModalProps {
  isInterviewStarted: boolean;
  disabled: boolean;
  mode: InterviewMode;
  // eslint-disable-next-line no-unused-vars
  onInterviewStart: (audioStream?: MediaStream) => void;
}

function InterviewStartModal({
  isInterviewStarted,
  disabled,
  onInterviewStart,
  mode
}: InterviewStartModalProps) {
  if (mode === "VOICE") {
    return (
      <VoiceModeStartModal
        isInterviewStarted={isInterviewStarted}
        disabled={disabled}
        onInterviewStart={onInterviewStart}
        mode={mode}
      />
    );
  }
  return (
    <TextModeStartModal
      isInterviewStarted={isInterviewStarted}
      disabled={disabled}
      onInterviewStart={onInterviewStart}
      mode={mode}
    />
  );
}

function TextModeStartModal({
  isInterviewStarted,
  disabled,
  onInterviewStart
}: InterviewStartModalProps) {
  const { isOpen, closeModal } = useModal(true);

  if (isInterviewStarted) return null;

  const handleStartInterview = () => {
    onInterviewStart();
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="면접 시작하기"
      closeButton={false}
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary">
            텍스트 면접 시작하기
          </h3>
          <p className="text-sm text-text-secondary">
            준비가 되시면 아래 버튼을 눌러 면접을 시작해주세요.
          </p>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">
                면접 시작 전 확인사항
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• 편안한 환경에서 면접을 진행해주세요</li>
                <li>• 질문을 잘 읽고 신중하게 답변해주세요</li>
                <li>• 답변은 구체적이고 명확하게 작성해주세요</li>
                <li>• 답변 제출 후에는 수정할 수 없습니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 시작 버튼 */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="xl"
            disabled={disabled}
            onClick={handleStartInterview}
            className="w-full text-base font-bold hover:scale-100"
          >
            면접 시작하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function VoiceModeStartModal({
  isInterviewStarted,
  disabled,
  onInterviewStart
}: InterviewStartModalProps) {
  const { isOpen, closeModal } = useModal(true);

  const isSpeechRecognitionSupported =
    "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

  if (isInterviewStarted) return null;

  const handleStartInterview = () => {
    if (isSpeechRecognitionSupported) {
      onInterviewStart();
      closeModal();
    }
  };

  const isStartDisabled = disabled || !isSpeechRecognitionSupported;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="면접 시작하기"
      closeButton={false}
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary">
            음성 면접 시작하기
          </h3>
          <p className="text-sm text-text-secondary">
            준비가 되시면 아래 버튼을 눌러 음성 면접을 시작해주세요.
          </p>
        </div>

        {/* Speech Recognition 지원 여부 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary">
            음성 인식 지원 확인
          </h3>

          <div className="flex items-center gap-3 p-4 rounded-lg border border-border-secondary bg-background-secondary">
            {isSpeechRecognitionSupported ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}

            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">
                {isSpeechRecognitionSupported
                  ? "음성 인식이 지원됩니다"
                  : "음성 인식이 지원되지 않습니다"}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {isSpeechRecognitionSupported
                  ? "브라우저에서 음성 인식 기능을 사용할 수 있습니다"
                  : "Chrome, Edge, Safari 등의 최신 브라우저를 사용해주세요"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-200 border border-orange-300 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <p className="text-sm text-orange-8">
            해당 디바이스의 마이크로만 면접을 진행할 수 있습니다.
          </p>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Mic className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">
                음성 면접 시작 전 확인사항
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• 조용한 환경에서 면접을 진행해주세요</li>
                <li>• 마이크가 정상적으로 작동하는지 확인해주세요</li>
                <li>• 브라우저에서 마이크 권한을 허용해주세요</li>
                <li>
                  • Chrome, Edge, Safari 등의 최신 브라우저를 사용해주세요
                </li>
                <li>• 음성 인식이 시작되면 명확하게 답변해주세요</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 시작 버튼 */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="xl"
            disabled={isStartDisabled}
            onClick={handleStartInterview}
            className="w-full text-base font-bold hover:scale-100"
          >
            {isStartDisabled
              ? "음성 인식이 지원되지 않습니다"
              : "음성 면접 시작하기"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default InterviewStartModal;
