import {
  Button,
  Modal,
  Radio,
  RadioGroup,
  Textarea,
  useToast
} from "@kokomen/ui";
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
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-text-primary">학습 메모</h4>
        <p className="text-sm text-text-secondary">내 학습 기록</p>
      </div>
      {isMemoEditOpen ? (
        <AnswerMemoEdit
          answerId={answerId}
          answerMemo={answerMemo}
          visibility={visibility}
          setAnswerMemo={setAnswerMemo}
          setIsMemoEditOpen={setIsMemoEditOpen}
        />
      ) : answerMemo.content ? (
        <div className="flex flex-col gap-1.5">
          <p className="min-h-24 whitespace-pre-line rounded-xl border border-primary-border bg-bg-base p-3 text-base text-text-primary">
            {answerMemo.content}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant={"secondary"}
              size={"small"}
              onClick={handleMemoEditButtonClick}
            >
              메모 편집하기
            </Button>
            <Button
              variant={"danger"}
              size={"small"}
              onClick={openMemoDeleteModal}
            >
              메모 삭제하기
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleMemoEditButtonClick}
            className="min-h-24 cursor-text rounded-xl border border-primary-border bg-bg-base p-3 text-left text-base text-text-placeholder transition-colors hover:border-primary-border-hover"
          >
            보완할 개념이나 다음 답변에 넣을 내용을 적어보세요.
          </button>
          <div className="flex justify-end">
            <Button
              variant={"secondary"}
              size={"small"}
              onClick={handleMemoEditButtonClick}
            >
              메모 작성하기
            </Button>
          </div>
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
                variant={"danger"}
                onClick={() => {
                  setIsTempMemoModalOpen(false);
                  setIsMemoEditOpen(true);
                }}
              >
                새로쓰기
              </Button>
              <Button
                type="button"
                variant={"primary"}
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
    </div>
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
          variant={"secondary"}
          size={"large"}
          onClick={toggleModal}
        >
          취소
        </Button>
        <Button
          type="button"
          size={"large"}
          variant={"danger"}
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
      <div className="flex items-center justify-between text-sm text-text-secondary">
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
      <Textarea
        name="memo"
        variant={"default"}
        aria-label="메모 작성하기"
        placeholder="보완할 개념이나 다음 답변에 넣을 내용을 적어보세요."
        className="h-24 w-full"
        value={watch("content")}
        onChange={(e) => setValue("content", e.target.value)}
      />
      {answerMemoFormErrors.content && (
        <p className="text-sm text-error">
          {answerMemoFormErrors.content.message}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button
          variant={"secondary"}
          size={"small"}
          type="button"
          onClick={() => setIsMemoEditOpen(false)}
        >
          취소
        </Button>
        <Button
          variant={"primary"}
          size={"small"}
          type="submit"
          disabled={isPending}
          pendingSpinner
          pendingText="저장중..."
        >
          메모 저장
        </Button>
      </div>
    </form>
  );
}
