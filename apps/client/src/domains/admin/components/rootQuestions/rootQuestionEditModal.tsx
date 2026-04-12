import { Modal, Button } from "@kokomen/ui";
import { InterviewQuestion } from "@kokomen/types";
import { JSX, useState, useEffect } from "react";

interface RootQuestionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: InterviewQuestion | null;
}

const RootQuestionEditModal = ({
  isOpen,
  onClose,
  question
}: RootQuestionEditModalProps): JSX.Element => {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (question) {
      setContent(question.content);
    }
  }, [question]);

  const handleSave = () => {
    // TODO: API 연동 (서버 구현 후 활성화)
    // await updateAdminQuestion(question.id, content);
    console.log("질문 수정:", { id: question?.id, content });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="질문 수정" size="lg" escToClose>
      <div className="flex flex-col gap-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary-bg focus:border-primary-border"
          placeholder="질문 내용을 입력하세요"
        />
        <div className="flex justify-end gap-2">
          <Button variant="soft" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSave}>
            저장
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RootQuestionEditModal;
