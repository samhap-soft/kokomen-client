import { Button } from "@kokomen/ui/components/button";
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
}): JSX.Element | null {
  const [interviewStart, setInterviewStart] = useState<boolean>(false);

  const startup = (): void => {
    dispatch({ type: "START_UP" });
    setInterviewStart(true);
    setTimeout(() => {
      dispatch({ ...state, type: "QUESTION", message: rootQuestion });
    }, 2000);
  };
  if (interviewStart) {
    return null;
  }
  return (
    <Button
      className="w-1/2 absolute bottom-40 left-1/4 text-xl font-bold"
      variant={"primary"}
      size={"xl"}
      onClick={() => startup()}
    >
      면접 시작하기
    </Button>
  );
}
