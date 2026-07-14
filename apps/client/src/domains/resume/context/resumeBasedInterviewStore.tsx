import { checkResumeBasedInterviewQuestion } from "@/domains/resume/api/resumeBasedInterview";
import { useResumeBasedInterviewEvent } from "@/domains/resume/utils/resumeInterviewEventEmitter";
import { ToastAction, useToast } from "@kokomen/ui";
import { useRouter } from "next/router";
import React, { createContext, useEffect, useRef, useState } from "react";

type ResumeBasedInterviewState = "IDLE" | "PENDING" | "COMPLETED" | "ERROR";
interface IResumeBasedInterviewStore {
  interviewState: ResumeBasedInterviewState;
  interviewResultId: number | null;
  // eslint-disable-next-line no-unused-vars
  setInterviewResultId: (interviewResultId: number) => void;
}
const ResumeBasedInterviewStore =
  createContext<IResumeBasedInterviewStore | null>(null);

export default function ResumeBasedInterviewStoreProvider({
  children
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [interviewState, setInterviewState] =
    useState<ResumeBasedInterviewState>("IDLE");
  const [interviewResultId, setInterviewResultId] = useState<number | null>(
    null
  );
  const router = useRouter();
  const { toast, dismiss } = useToast();
  // 진행 중 toast의 id를 보관했다가 완료/오류 시 제거
  const pendingToastIdRef = useRef<string | null>(null);

  useResumeBasedInterviewEvent(
    "resumeBasedInterview:submitted",
    async (payload) => {
      try {
        setInterviewState("PENDING");
        setInterviewResultId(payload.resume_based_interview_result_id);
        const response = await checkResumeBasedInterviewQuestion(
          payload.resume_based_interview_result_id
        );
        if (response.state === "COMPLETED") {
          setInterviewState("COMPLETED");
        } else if (response.state === "FAILED") {
          setInterviewState("ERROR");
        }
      } catch (error) {
        setInterviewState("ERROR");
      }
    }
  );

  const dismissPendingToast = (): void => {
    if (pendingToastIdRef.current) {
      dismiss(pendingToastIdRef.current);
      pendingToastIdRef.current = null;
    }
  };

  useEffect(() => {
    if (interviewState === "PENDING") {
      dismissPendingToast();
      const { id } = toast({
        title: "면접 질문 생성 중...",
        description: "질문 생성이 완료되면 알려드릴게요.",
        variant: "info",
        position: "top-center",
        duration: Infinity
      });
      pendingToastIdRef.current = id;
    } else if (interviewState === "COMPLETED") {
      dismissPendingToast();
      toast({
        title: "면접 질문 생성 완료",
        description: "생성된 질문으로 면접을 시작해보세요.",
        variant: "success",
        position: "top-center",
        duration: Infinity,
        action: (
          <ToastAction
            onClick={() => {
              router.push(`/resume/interview/${interviewResultId}`);
              setInterviewState("IDLE");
              setInterviewResultId(null);
            }}
          >
            면접 시작하기
          </ToastAction>
        )
      });
      setInterviewState("IDLE");
    } else if (interviewState === "ERROR") {
      dismissPendingToast();
      toast({
        title: "면접 질문 생성 중 오류가 발생했어요",
        description: "잠시 후 다시 시도해주세요.",
        variant: "error",
        position: "top-center"
      });
      setInterviewState("IDLE");
      setInterviewResultId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewState]);

  return (
    <ResumeBasedInterviewStore.Provider
      value={{ interviewState, interviewResultId, setInterviewResultId }}
    >
      {children}
    </ResumeBasedInterviewStore.Provider>
  );
}
