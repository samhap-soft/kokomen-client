import { Modal, Button } from "@kokomen/ui";
import { InterviewQuestion } from "@kokomen/types";
import { JSX } from "react";

interface RootQuestionDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: InterviewQuestion | null;
}

const RootQuestionDeleteModal = ({
  isOpen,
  onClose,
  question
}: RootQuestionDeleteModalProps): JSX.Element => {
  const handleDelete = () => {
    // TODO: API 연동 (서버 구현 후 활성화)
    // await deleteAdminQuestion(question.id);
    console.log("질문 삭제:", { id: question?.id });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="질문 삭제" size="sm" escToClose>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-700">이 질문을 삭제하시겠습니까?</p>
        {question && (
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200">
            {question.content}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="soft" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            삭제
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RootQuestionDeleteModal;
