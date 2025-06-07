import { InterviewStatus } from "@/domains/interview/types";
import { Dispatch, useReducer } from "react";

const INTERVIEW_STARTUP: string =
  "안녕하세요! 꼬꼬면 면접에 오신 것을 환영합니다. 면접을 시작하겠습니다.";
const INTERVIEW_SUBMIT_FAILED: string =
  "답변 제출에 실패했습니다. 다시 시도해주세요.";
const INTERVIEW_FINISHED: string = "면접이 종료되었습니다. 수고하셨습니다!";

interface IInterviewState {
  message: string;
  status: InterviewStatus;
  currentQuestionId: number;
}

type InterviewActions = Dispatch<InterviewAction>;

interface IStartupAction {
  type: "START_UP";
}
interface IAnswerQuestionAction {
  type: "ANSWER_QUESTION";
}
interface IInterviewEndAction {
  type: "INTERVIEW_END";
}
interface ISubmitFailedAction {
  type: "SUBMIT_FAILED";
}
interface IQuestionAction {
  type: "QUESTION";
  message: string;
  currentQuestionId: number;
}
type InterviewAction =
  | IStartupAction
  | IAnswerQuestionAction
  | IInterviewEndAction
  | ISubmitFailedAction
  | IQuestionAction;

function reducer(
  state: IInterviewState,
  action: InterviewAction
): IInterviewState {
  switch (action.type) {
    case "ANSWER_QUESTION":
      return {
        ...state,
        status: "thinking",
      };
    case "START_UP":
      return {
        ...state,
        status: "standby",
        message: INTERVIEW_STARTUP,
      };
    case "INTERVIEW_END":
      return {
        ...state,
        status: "standby",
        message: INTERVIEW_FINISHED,
      };
    case "QUESTION":
      return {
        ...state,
        message: action.message,
        status: "question",
        currentQuestionId: action.currentQuestionId,
      };
    case "SUBMIT_FAILED":
      return {
        ...state,
        status: "standby",
        message: INTERVIEW_SUBMIT_FAILED,
      };
    default:
      return state;
  }
}

const useInterviewStatus = ({
  questionId,
}: {
  questionId: number;
  rootQuestion: string;
}): { state: IInterviewState; dispatch: InterviewActions } => {
  const [state, dispatch] = useReducer(reducer, {
    message: INTERVIEW_STARTUP,
    status: "standby",
    currentQuestionId: questionId,
  });

  return { state, dispatch };
};

export { useInterviewStatus };
export type { InterviewActions, IInterviewState };
