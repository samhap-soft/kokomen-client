import {
  Button,
  useToast,
  Radio,
  RadioGroup,
  Modal,
  Textarea
} from "@kokomen/ui";
import { NotebookPen, Trash } from "lucide-react";
import { Dispatch, JSX, SetStateAction, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  createNewAnswerMemo,
  deleteAnswerMemo,
  updateAnswerMemo
} from "@/domains/interviewReport/api/answerMemo";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import z from "zod";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useModal } from "@/hooks/useModal";
import { captureFormSubmitEvent } from "@/utils/analytics";
import { AnswerMemo } from "@kokomen/types";

export default function AnswerMemoComponent({
  answerId,
  tempMemo,
  visibility,
  answerMemoProp
}: {
  answerId: number;
  tempMemo: string;
  visibility: "PUBLIC" | "PRIVATE" | "FRIENDS";
  answerMemoProp: string;
}): JSX.Element {
  const [isMemoEditOpen, setIsMemoEditOpen] = useState(false);
  const {
    isOpen: isMemoDeleteModalOpen,
    openModal: openMemoDeleteModal,
    toggleModal: toggleMemoDeleteModal
  } = useModal();
  const [isTempMemoModalOpen, setIsTempMemoModalOpen] = useState(false);
  const [answerMemo, setAnswerMemo] = useState<AnswerMemo>({
    content: answerMemoProp,
    visibility: visibility
  });

  const handleMemoEditButtonClick = (): void => {
    if (tempMemo) {
      setIsTempMemoModalOpen(true);
    } else {
      setIsMemoEditOpen(true);
    }
  };
  if (isMemoEditOpen)
    return (
      <AnswerMemoEdit
        answerId={answerId}
        answerMemo={answerMemo}
        visibility={visibility}
        setAnswerMemo={setAnswerMemo}
        setIsMemoEditOpen={setIsMemoEditOpen}
      />
    );
  return (
    <>
      {answerMemo.content ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button variant={"glass"} onClick={handleMemoEditButtonClick}>
              <NotebookPen />
              메모 편집하기
            </Button>
            <Button variant={"warning"} onClick={openMemoDeleteModal}>
              <Trash />
              메모 삭제하기
            </Button>
          </div>
          <p className="border border-border-secondary p-4 rounded-lg">
            {answerMemo.content}
          </p>
        </div>
      ) : (
        <div className="border border-border-secondary p-4 rounded-lg flex flex-col justify-between items-center gap-3">
          <p>보완이 필요하거나 학습한 내용을 메모해 보세요.</p>
          <Button
            className="w-full"
            variant={"glass"}
            onClick={handleMemoEditButtonClick}
            disabled={isMemoEditOpen}
          >
            <NotebookPen /> 메모 작성하기
          </Button>
        </div>
      )}
      {isMemoDeleteModalOpen && (
        <AnswerMemoDeleteModal
          answerId={answerId}
          setAnswerMemo={setAnswerMemo}
          isMemoDeleteModalOpen={isMemoDeleteModalOpen}
          toggleModal={toggleMemoDeleteModal}
        />
      )}

      {isTempMemoModalOpen && (
        <Modal
          isOpen={isTempMemoModalOpen}
          onClose={() => setIsTempMemoModalOpen(false)}
          title="임시 메모 작성"
        >
          <div>
            <p>임시 작성중인 메모가 있습니다. 메모를 불러올까요?</p>
            <div>
              <Button
                type="button"
                variant={"warning"}
                onClick={() => {
                  setIsTempMemoModalOpen(false);
                  setIsMemoEditOpen(true);
                }}
              >
                새로쓰기
              </Button>
              <Button
                type="button"
                variant={"success"}
                onClick={() => {
                  setAnswerMemo((prev) => ({
                    content: tempMemo,
                    visibility: prev.visibility
                  }));
                  setIsMemoEditOpen(true);
                }}
              >
                이어서 작성
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function AnswerMemoDeleteModal({
  answerId,
  setAnswerMemo,
  isMemoDeleteModalOpen,
  toggleModal
}: {
  answerId: number;
  setAnswerMemo: Dispatch<SetStateAction<AnswerMemo>>;
  isMemoDeleteModalOpen: boolean;
  toggleModal: () => void;
}): JSX.Element {
  const { error: errorToast } = useToast();
  const { mutate: deleteAnswerMemoMutate } = useMutation({
    mutationFn: () => deleteAnswerMemo(answerId),
    onMutate: () => {
      captureFormSubmitEvent({
        name: "deleteMemo",
        properties: {
          answerId: answerId
        }
      });
      toggleModal();
      setAnswerMemo({
        content: "",
        visibility: "PUBLIC"
      });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        errorToast({
          title: "메모 삭제 실패",
          description:
            error.response?.data.message || "메모 삭제에 실패했습니다."
        });
      } else {
        errorToast({
          title: "메모 삭제 실패",
          description:
            "서버 오류가 발생하여 메모 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요."
        });
      }
    }
  });
  return (
    <Modal
      isOpen={isMemoDeleteModalOpen}
      onClose={toggleModal}
      title="메모 삭제"
    >
      <p className="text-xl mb-5 text-center">
        메모를 삭제하시겠습니까? <br /> 삭제 후 복구가 불가능합니다.
      </p>
      <div className="grid grid-cols-2 gap-2 font-bold">
        <Button
          type="button"
          variant={"default"}
          size={"large"}
          onClick={toggleModal}
        >
          취소
        </Button>
        <Button
          type="button"
          size={"large"}
          variant={"warning"}
          onClick={() => deleteAnswerMemoMutate()}
        >
          삭제하기
        </Button>
      </div>
    </Modal>
  );
}

const answerMemoSchema = z.object({
  content: z.string({ message: "메모를 입력해주세요." }),
  visibility: z.enum(["PUBLIC", "PRIVATE"])
});

function AnswerMemoEdit({
  answerId,
  answerMemo,
  setAnswerMemo,
  setIsMemoEditOpen
}: {
  answerId: number;
  answerMemo: AnswerMemo;
  visibility: AnswerMemo["visibility"];
  setAnswerMemo: Dispatch<SetStateAction<AnswerMemo>>;
  setIsMemoEditOpen: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const { error: errorToast } = useToast();
  const {
    handleSubmit,
    setValue,
    formState: { errors: answerMemoFormErrors },
    watch
  } = useForm<z.infer<typeof answerMemoSchema>>({
    defaultValues: {
      content: answerMemo.content,
      visibility: answerMemo.visibility as "PUBLIC" | "PRIVATE"
    },
    resolver: standardSchemaResolver(answerMemoSchema)
  });

  const { mutate: createNewAnswerMemoMutate, isPending } = useMutation({
    mutationFn: (memo: AnswerMemo) => {
      if (!answerMemo.content) {
        return createNewAnswerMemo(answerId, memo);
      } else {
        return updateAnswerMemo(answerId, memo);
      }
    },
    onMutate: (answerMemo) => {
      captureFormSubmitEvent({
        name: !answerMemo.content ? "createMemo" : "editMemo",
        properties: {
          answerId: answerId,
          content: answerMemo.content,
          visibility: answerMemo.visibility
        }
      });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        errorToast({
          title: "메모 작성 실패",
          description:
            error.response?.data.message || "메모 작성에 실패했습니다."
        });
      } else {
        errorToast({
          title: "메모 작성 실패",
          description:
            "서버 오류가 발생하여 메모 저장이 실패했습니다. 잠시 후 다시 시도해 주세요."
        });
      }
    },
    onSuccess: (_, answerMemo) => {
      setAnswerMemo(answerMemo);
      setIsMemoEditOpen(false);
    }
  });

  const handleEditSubmitButtonClick = (data: AnswerMemo): void => {
    createNewAnswerMemoMutate(data);
    setIsMemoEditOpen(false);
  };

  return (
    <form
      className="flex flex-col gap-2 w-full"
      onSubmit={handleSubmit(handleEditSubmitButtonClick)}
    >
      <div className="flex justify-between">
        <p>공개 범위</p>
        <RadioGroup
          onChange={(value) =>
            setValue("visibility", value as "PUBLIC" | "PRIVATE")
          }
          value={watch("visibility")}
        >
          <Radio value="PUBLIC">공개</Radio>
          <Radio value="PRIVATE">비공개</Radio>
        </RadioGroup>
      </div>
      <p className="mt-4">메모 작성하기</p>
      <Textarea
        name="memo"
        variant={"default"}
        className="border border-border-secondary"
        value={watch("content")}
        onChange={(e) => setValue("content", e.target.value)}
      />
      {answerMemoFormErrors.content && (
        <p className="text-red-500">{answerMemoFormErrors.content.message}</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={"warning"}
          type="button"
          onClick={() => setIsMemoEditOpen(false)}
        >
          취소
        </Button>
        <Button
          variant={"success"}
          type="submit"
          disabled={isPending}
          pendingSpinner
          pendingText="저장중..."
        >
          저장
        </Button>
      </div>
    </form>
  );
}
