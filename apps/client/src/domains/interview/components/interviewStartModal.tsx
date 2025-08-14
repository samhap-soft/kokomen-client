import { Button, Modal, Select } from "@kokomen/ui";
import { useModal } from "@kokomen/utils";
import { useState, useEffect, useCallback } from "react";
import { Mic, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface MicrophoneDevice {
  deviceId: string;
  label: string;
}

interface InterviewStartModalProps {
  isInterviewStarted: boolean;
  disabled: boolean;
  // eslint-disable-next-line no-unused-vars
  onInterviewStart: (audioStream?: MediaStream) => void;
}

function InterviewStartModal({
  isInterviewStarted,
  disabled,
  onInterviewStart
}: InterviewStartModalProps) {
  const { isOpen, closeModal } = useModal(true);
  const [microphoneDevices, setMicrophoneDevices] = useState<
    MicrophoneDevice[]
  >([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [permissionStatus, setPermissionStatus] = useState<
    "granted" | "denied" | "prompt" | "checking"
  >("checking");
  const [isLoading, setIsLoading] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const isSpeechRecognitionSupported =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  // 마이크 권한 확인
  const checkMicrophonePermission = useCallback(async () => {
    try {
      const permission = await navigator.permissions.query({
        name: "microphone" as PermissionName
      });
      setPermissionStatus(permission.state as "granted" | "denied" | "prompt");

      // 권한 상태 변경 감지
      permission.onchange = () => {
        setPermissionStatus(
          permission.state as "granted" | "denied" | "prompt"
        );
      };
    } catch (error) {
      console.error("마이크 권한 확인 실패:", error);
      setPermissionStatus("prompt");
    }
  }, []);

  // 마이크 장치 목록 가져오기
  const getMicrophoneDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const microphones = devices
        .filter((device) => device.kind === "audioinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `마이크 ${device.deviceId.slice(0, 8)}...`
        }));

      setMicrophoneDevices(microphones);

      // 기본 장치 선택
      if (microphones.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(microphones[0].deviceId);
      }
    } catch (error) {
      console.error("마이크 장치 목록 가져오기 실패:", error);
    }
  }, [selectedDeviceId]);

  // 선택된 마이크로 오디오 스트림 생성
  const createAudioStream = useCallback(async (deviceId: string) => {
    try {
      // 기존 스트림이 있다면 정리
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId }
        }
      });

      setAudioStream(stream);
      return stream;
    } catch (error) {
      console.error("오디오 스트림 생성 실패:", error);
      // 선택한 장치로 실패하면 기본 설정으로 시도
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        setAudioStream(fallbackStream);
        return fallbackStream;
      } catch (fallbackError) {
        console.error("기본 오디오 스트림 생성도 실패:", fallbackError);
        return null;
      }
    }
  }, []);

  // 마이크 장치 변경 시 스트림 재생성
  useEffect(() => {
    if (selectedDeviceId) {
      createAudioStream(selectedDeviceId);
    }
  }, [selectedDeviceId, createAudioStream]);

  // 마이크 권한 요청
  const requestMicrophonePermission = useCallback(async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // 테스트용 스트림 정리
      setPermissionStatus("granted");
      await getMicrophoneDevices(); // 권한 획득 후 장치 목록 새로고침
    } catch (error) {
      console.error("마이크 권한 요청 실패:", error);
      setPermissionStatus("denied");
    } finally {
      setIsLoading(false);
    }
  }, [getMicrophoneDevices]);

  // 초기화
  useEffect(() => {
    checkMicrophonePermission();
    getMicrophoneDevices();
  }, [checkMicrophonePermission, getMicrophoneDevices]);

  // 장치 변경 감지
  useEffect(() => {
    const handleDeviceChange = () => {
      getMicrophoneDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
    };
  }, [getMicrophoneDevices]);

  // 컴포넌트 언마운트 시 스트림 정리
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [audioStream]);

  if (isInterviewStarted) return null;

  const handleStartInterview = () => {
    if (permissionStatus === "granted" && selectedDeviceId && audioStream) {
      onInterviewStart(audioStream);
      closeModal();
    }
  };

  const isStartDisabled =
    disabled ||
    permissionStatus !== "granted" ||
    !selectedDeviceId ||
    !audioStream ||
    !isSpeechRecognitionSupported ||
    isLoading;

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="면접 시작하기">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Speech Recognition 지원 여부 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary">
            음성 인식 지원 확인
          </h3>

          <div className="flex items-center gap-3 p-4 rounded-lg border border-border-secondary">
            {isSpeechRecognitionSupported ? (
              <CheckCircle className="w-5 h-5 text-green-5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-5" />
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

        {/* 마이크 권한 상태 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary">
            마이크 권한 설정
          </h3>

          <div className="flex items-center gap-3 p-4 rounded-lg border border-border-secondary">
            {permissionStatus === "granted" ? (
              <CheckCircle className="w-5 h-5 text-green-5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-5" />
            )}

            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">
                {permissionStatus === "granted"
                  ? "마이크 권한이 허용되었습니다"
                  : permissionStatus === "denied"
                    ? "마이크 권한이 거부되었습니다"
                    : "마이크 권한이 필요합니다"}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                면접에서 음성 인식을 위해 마이크 접근 권한이 필요합니다
              </p>
            </div>

            {permissionStatus !== "granted" && (
              <Button
                variant="outline"
                size="small"
                onClick={requestMicrophonePermission}
                disabled={isLoading}
                className="whitespace-nowrap"
              >
                {isLoading ? "요청 중..." : "권한 요청"}
              </Button>
            )}
          </div>
        </div>

        {/* 마이크 장치 선택 */}
        {permissionStatus === "granted" && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">
              마이크 장치 선택
            </h3>

            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">
                사용할 마이크를 선택해주세요
              </p>

              <Select
                options={microphoneDevices.map((device) => ({
                  value: device.deviceId,
                  label: device.label
                }))}
                value={selectedDeviceId}
                onChange={setSelectedDeviceId}
                placeholder="마이크를 선택하세요"
                disabled={microphoneDevices.length === 0}
                aria-label="마이크 장치 선택"
              />

              {microphoneDevices.length === 0 && (
                <p className="text-xs text-text-tertiary">
                  사용 가능한 마이크 장치가 없습니다
                </p>
              )}

              {/* 현재 선택된 마이크 상태 표시 */}
              {audioStream && selectedDeviceId && (
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-800">
                    선택된 마이크가 활성화되었습니다
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Mic className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">
                면접 시작 전 확인사항
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• 조용한 환경에서 면접을 진행해주세요</li>
                <li>• 마이크가 정상적으로 작동하는지 확인해주세요</li>
                <li>• 브라우저에서 마이크 권한을 허용해주세요</li>
                <li>• 선택한 마이크가 활성화되어 있는지 확인해주세요</li>
                <li>
                  • Chrome, Edge, Safari 등의 최신 브라우저를 사용해주세요
                </li>
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
            className="w-full text-base font-bold"
          >
            {isStartDisabled
              ? !isSpeechRecognitionSupported
                ? "음성 인식이 지원되지 않습니다"
                : permissionStatus === "denied"
                  ? "마이크 권한이 필요합니다"
                  : permissionStatus === "checking"
                    ? "권한 확인 중..."
                    : !audioStream
                      ? "마이크 연결 중..."
                      : "면접 시작하기"
              : "면접 시작하기"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default InterviewStartModal;
