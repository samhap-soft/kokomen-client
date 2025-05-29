import { submitInterviewAnswer } from "@/domains/interview/api/interviewAnswer";
import { RobotStatus } from "@/domains/interview/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";

interface InterviewProviderProps {
  children: React.ReactNode;
  interviewId: number;
  message: string;
  status: RobotStatus;
  rootQuestion: string;
  answerQuestion: (answer: string) => Promise<void>;
  exit: () => void;
  interviewStartup: () => void;
}

const InterviewContext = createContext<InterviewProviderProps | null>(null);

const INTERVIEW_STARTUP = [
  "안녕하세요! 반갑습니다.",
  "면접에 참여해주셔서 감사합니다",
  "면접은 편하게 진행되니, 긴장하지 마세요.",
  "면접이 끝나면, 피드백을 드릴 예정입니다.",
  "면접을 시작하겠습니다.",
];
let startup_idx = 0;

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
  const [message, _setMessage] = useState<string>("");
  const [status, _setStatus] = useState<RobotStatus>("beforeStart");
  const [currentQuestionId, setCurrentQuestionId] =
    useState<number>(questionId);
  const navigate = useRouter();

  const interviewStartup = () => {
    _setStatus("standby");
    startupMessage();
  };
  const startupMessage = () => {
    if (startup_idx < INTERVIEW_STARTUP.length) {
      changeMessage(INTERVIEW_STARTUP[startup_idx++]);
      setTimeout(startupMessage, 2000);
      return;
    }
    if (startup_idx === INTERVIEW_STARTUP.length) {
      changeMessage(rootQuestion);
      _setStatus("question");
      return;
    }
  };

  const changeMessage = (newMessage: string) => {
    _setMessage(newMessage);
  };

  const answerQuestion = async (answer: string) => {
    try {
      _setStatus("thinking");
      const response = await axios.post(
        `/api/interviews/${interviewId}/questions/${currentQuestionId}/answers`,
        {
          interview_id: interviewId,
          question_id: currentQuestionId ?? questionId,
          answer,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      if (response.status === 204) {
        _setStatus("finished");
        changeMessage("면접이 종료되었습니다. 고생 많으셨습니다.");
        setTimeout(() => {
          navigate.push(`/interview/${interviewId}/result`);
        }, 3000);
        return;
      }
      changeMessage(response.data.question);
      _setStatus("question");
      setCurrentQuestionId(response.data.question_id);
    } catch {
      _setStatus("standby");
      changeMessage("답변을 제출하는데 실패했습니다. 다시 시도해주세요.");
    }
  };

  const exit = () => {
    if (status === "beforeStart") {
      navigate.back();
      return;
    }
  };

  return (
    <InterviewContext.Provider
      value={{
        exit,
        children,
        interviewId,
        message,
        status,
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
