import { getResumeEvaluationState } from "@/domains/resume/api";
import { useReportevent } from "@/domains/resume/utils/reportEventEmitter";
import { ToastAction, useToast } from "@kokomen/ui";
import { useRouter } from "next/router";
import React, { createContext, useEffect, useRef, useState } from "react";

type ResumeState = "IDLE" | "PENDING" | "COMPLETED" | "ERROR";
interface IResumeStore {
  reportState: ResumeState;
  evaluationId: string | null;
  // eslint-disable-next-line no-unused-vars
  setEvaluationId: (evaluationId: string) => void;
}
const ResumeStore = createContext<IResumeStore | null>(null);

export default function ResumeStoreProvider({
  children
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [reportState, setReportState] = useState<ResumeState>("IDLE");
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const router = useRouter();
  const { toast, dismiss } = useToast();
  // 진행 중 toast의 id를 보관했다가 완료/오류 시 제거
  const pendingToastIdRef = useRef<string | null>(null);

  useReportevent("report:submitted", async (payload) => {
    try {
      setReportState("PENDING");
      setEvaluationId(payload.evaluation_id);
      const response = await getResumeEvaluationState(payload.evaluation_id);
      if (response.state === "COMPLETED") {
        setReportState("COMPLETED");
      }
    } catch (error) {
      setReportState("ERROR");
    }
  });

  const dismissPendingToast = (): void => {
    if (pendingToastIdRef.current) {
      dismiss(pendingToastIdRef.current);
      pendingToastIdRef.current = null;
    }
  };

  useEffect(() => {
    if (reportState === "PENDING") {
      dismissPendingToast();
      const { id } = toast({
        title: "이력서 평가 중...",
        description: "평가가 완료되면 알려드릴게요.",
        variant: "info",
        position: "top-center",
        duration: Infinity
      });
      pendingToastIdRef.current = id;
    } else if (reportState === "COMPLETED") {
      dismissPendingToast();
      toast({
        title: "이력서 평가 완료",
        description: "평가 결과를 확인해보세요.",
        variant: "success",
        position: "top-center",
        duration: Infinity,
        action: (
          <ToastAction
            onClick={() => {
              router.push(`/resume/eval/${evaluationId}/result`);
              setReportState("IDLE");
              setEvaluationId(null);
            }}
          >
            결과 보기
          </ToastAction>
        )
      });
      setReportState("IDLE");
    } else if (reportState === "ERROR") {
      dismissPendingToast();
      toast({
        title: "이력서 평가 중 오류가 발생했어요",
        description: "잠시 후 다시 시도해주세요.",
        variant: "error",
        position: "top-center"
      });
      setReportState("IDLE");
      setEvaluationId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportState]);

  return (
    <ResumeStore.Provider value={{ reportState, evaluationId, setEvaluationId }}>
      {children}
    </ResumeStore.Provider>
  );
}
