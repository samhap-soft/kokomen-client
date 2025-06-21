import { Modal } from "@kokomen/ui/components/modal";
import { Button } from "@kokomen/ui/components/button";
import { useRouter } from "next/router";
import {
  IInterviewState,
  InterviewActions,
} from "@/domains/interview/hooks/useInterviewStatus";
import { JSX, useState } from "react";

export default function InterviewModals({
  state,
  dispatch,
  rootQuestion,
}: {
  state: IInterviewState;
  dispatch: InterviewActions;
  rootQuestion: string;
}): JSX.Element {
  return (
    <StartNewInterviewModal
      state={state}
      dispatch={dispatch}
      rootQuestion={rootQuestion}
    />
  );
}

function StartNewInterviewModal({
  state,
  dispatch,
  rootQuestion,
}: {
  state: IInterviewState;
  dispatch: InterviewActions;
  rootQuestion: string;
}): JSX.Element {
  const [interviewModal, setInterviewModal] = useState<boolean>(true);
  const router = useRouter();

  const startup = (): void => {
    dispatch({ type: "START_UP" });
    setInterviewModal(false);
    setTimeout(() => {
      dispatch({ ...state, type: "QUESTION", message: rootQuestion });
    }, 2000);
  };
  return (
    <Modal visible={interviewModal}>
      <div className="flex flex-col items-center justify-center p-8 w-1/2 min-w-[450px] bg-bg-base rounded-xl">
        <h2 className="text-2xl font-bold mb-4">인터뷰 시작하기</h2>
        <p className="text-lg">인터뷰를 시작합니다. 준비 되셨나요?</p>
        <div className="mt-8 flex gap-4 w-full">
          <Button
            className="w-full"
            size={"default"}
            variant={"primary"}
            danger
            onClick={() => router.back()}
          >
            나가기
          </Button>
          <Button
            className="w-full"
            variant={"primary"}
            size={"default"}
            onClick={() => startup()}
          >
            시작하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
