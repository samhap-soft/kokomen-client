import { submitInterviewAnswer } from "@/domains/interview/api/interviewAnswer";
import { InterviewStatus } from "@/domains/interview/types";
import { createContext, useContext, useReducer } from "react";

interface InterviewProviderProps {
  interviewId: number;
  message: string;
  status: InterviewStatus;
  rootQuestion: string;
  answerQuestion: (answer: string) => Promise<void>;
  interviewStartup: () => void;
}

const InterviewContext = createContext<InterviewProviderProps | null>(null);

const INTERVIEW_STARTUP =
  "안녕하세요! 꼬꼬면 면접에 오신 것을 환영합니다. 면접을 시작하겠습니다.";
const INTERVIEW_SUBMIT_FAILED = "답변 제출에 실패했습니다. 다시 시도해주세요.";
interface InterviewState {
  message: string;
  status: InterviewStatus;
  currentQuestionId: number;
}
interface InterviewAction {
  type:
    | "ANSWER_QUESTION"
    | "START_UP"
    | "INTERVIEW_END"
    | "QUESTION"
    | "SUBMIT_FAILED";
  payload: {
    message?: string;
    status?: InterviewStatus;
    currentQuestionId?: number | null;
  };
}

function reducer(
  state: InterviewState,
  action: InterviewAction
): InterviewState {
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
        status: "finished",
        message: "면접이 종료되었습니다.",
      };
    case "QUESTION":
      return {
        ...state,
        message: action?.payload?.message as string,
        status: "question",
        currentQuestionId: action?.payload?.currentQuestionId as number,
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

export const InterviewProvider = ({
  children,
  interviewId,
  questionId,
  rootQuestion,
}: {
  children: React.ReactNode;
  interviewId: number;
  questionId: number;
  rootQuestion: string;
}) => {
  const [state, dispatch] = useReducer(reducer, {
    message: INTERVIEW_STARTUP,
    status: "beforeStart",
    currentQuestionId: questionId,
  });

  const interviewStartup = () => {
    dispatch({ type: "START_UP", payload: {} });
    setTimeout(
      () => dispatch({ type: "QUESTION", payload: { message: rootQuestion } }),
      2000
    );
  };

  const answerQuestion = async (answer: string) => {
    const prevMessage = state.message;
    try {
      dispatch({ type: "QUESTION", payload: { status: "thinking" } });
      const response = await submitInterviewAnswer({
        answer: answer,
        interview_id: interviewId,
        question_id: state.currentQuestionId,
      });
      if (response.status === 204) {
        dispatch({ type: "QUESTION", payload: { status: "finished" } });
        return;
      }
      dispatch({
        type: "QUESTION",
        payload: {
          status: "question",
          message: response.data.question,
          currentQuestionId: response.data.question_id,
        },
      });
    } catch {
      dispatch({ type: "SUBMIT_FAILED", payload: {} });
      setTimeout(() => {
        dispatch({
          type: "QUESTION",
          payload: { message: prevMessage, status: "question" },
        });
      }, 2000);
    }
  };

  return (
    <InterviewContext.Provider
      value={{
        interviewId,
        message: state.message,
        status: state.status,
        rootQuestion,
        answerQuestion,
        interviewStartup,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export function useInterviewContext() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error(
      "useInterviewContext must be used within an InterviewProvider"
    );
  }
  return context;
}
