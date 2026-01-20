import { Modal } from "@kokomen/ui";
import { InterviewMode } from "@kokomen/types";
import { Mic, FileText } from "lucide-react";

interface ResumeInterviewModeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSelectMode: (mode: InterviewMode) => void;
}

export default function ResumeInterviewModeSelectModal({
  isOpen,
  onClose,
  onSelectMode
}: ResumeInterviewModeSelectModalProps) {
  const handleSelectMode = (mode: InterviewMode) => {
    onSelectMode(mode);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="면접 모드 선택" size="md">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          면접을 진행할 모드를 선택해주세요.
        </p>

        <div className="grid grid-cols-1 gap-4">
          <button
            type="button"
            onClick={() => handleSelectMode("TEXT")}
            className="flex items-start gap-4 p-4 border-2 border-border rounded-lg hover:border-primary transition-colors text-left"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-heading mb-1">
                텍스트 모드
              </h3>
              <p className="text-sm text-text-secondary">
                질문을 읽고 텍스트로 답변하는 면접 모드입니다.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode("VOICE")}
            className="flex items-start gap-4 p-4 border-2 border-border rounded-lg hover:border-primary transition-colors text-left"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Mic className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-heading mb-1">
                음성 모드
              </h3>
              <p className="text-sm text-text-secondary">
                질문을 듣고 음성으로 답변하는 면접 모드입니다.
              </p>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
}
