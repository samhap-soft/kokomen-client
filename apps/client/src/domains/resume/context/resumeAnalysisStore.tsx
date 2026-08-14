import { pollResumeAnalysisState } from "@/domains/resume/api/resumeAnalysis";
import { resumeAnalysisResultPath } from "@/domains/resume/utils/resumeAnalysisPath";
import { useResumeAnalysisEvent } from "@/domains/resume/utils/resumeAnalysisEventEmitter";
import { ToastAction, useToast } from "@kokomen/ui";
import { resumeAnalysisKeys } from "@/utils/querykeys";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

type ResumeAnalysisProgressState = "IDLE" | "PENDING" | "COMPLETED" | "ERROR";

type SubmittedAnalysis = {
  analysisId: number;
  guestToken?: string;
};

interface IResumeAnalysisStore {
  analysisState: ResumeAnalysisProgressState;
  submittedAnalysis: SubmittedAnalysis | null;
}
const ResumeAnalysisStore: React.Context<IResumeAnalysisStore | null> =
  createContext<IResumeAnalysisStore | null>(null);

const DEFAULT_ERROR_MESSAGE: string = "이력서 분석 중 오류가 발생했어요";

/**
 * 이력서 분석은 제출 후 평가 -> 질문 생성까지 시간이 걸리므로,
 * 페이지를 벗어나도 폴링이 유지되도록 앱 최상단에서 상태를 관리한다.
 */
export default function ResumeAnalysisStoreProvider({
  children
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [analysisState, setAnalysisState] =
    useState<ResumeAnalysisProgressState>("IDLE");
  const [submittedAnalysis, setSubmittedAnalysis] =
    useState<SubmittedAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>(
    DEFAULT_ERROR_MESSAGE
  );
  const router = useRouter();
  const { toast, dismiss } = useToast();
  const queryClient = useQueryClient();
  // 진행 중 toast의 id를 보관했다가 완료/오류 시 제거
  const pendingToastIdRef = useRef<string | null>(null);

  useResumeAnalysisEvent("resumeAnalysis:submitted", async (payload) => {
    const analysis: SubmittedAnalysis = {
      analysisId: payload.analysis_id,
      guestToken: payload.guest_token
    };
    setSubmittedAnalysis(analysis);
    setAnalysisState("PENDING");
    try {
      const response = await pollResumeAnalysisState(
        analysis.analysisId,
        analysis.guestToken
      );
      if (response.state === "COMPLETED") {
        setAnalysisState("COMPLETED");
        return;
      }
      setErrorMessage(DEFAULT_ERROR_MESSAGE);
      setAnalysisState("ERROR");
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : DEFAULT_ERROR_MESSAGE
      );
      setAnalysisState("ERROR");
    } finally {
      // 성공이든 실패든 목록의 state가 바뀌었으므로 히스토리를 다시 불러온다
      queryClient.invalidateQueries({ queryKey: resumeAnalysisKeys.all });
    }
  });

  const dismissPendingToast = (): void => {
    if (pendingToastIdRef.current) {
      dismiss(pendingToastIdRef.current);
      pendingToastIdRef.current = null;
    }
  };

  useEffect(() => {
    if (analysisState === "PENDING") {
      dismissPendingToast();
      const { id } = toast({
        title: "이력서 분석 중...",
        description: "평가와 면접 질문 생성이 끝나면 알려드릴게요.",
        variant: "info",
        position: "top-center",
        duration: Infinity
      });
      pendingToastIdRef.current = id;
    } else if (analysisState === "COMPLETED") {
      dismissPendingToast();
      const analysis = submittedAnalysis;
      toast({
        title: "이력서 분석 완료",
        description: "평가 결과와 이력서 기반 면접 질문을 확인해보세요.",
        variant: "success",
        position: "top-center",
        duration: Infinity,
        action: (
          <ToastAction
            onClick={() => {
              if (analysis) {
                router.push(
                  resumeAnalysisResultPath(
                    analysis.analysisId,
                    analysis.guestToken
                  )
                );
              }
              setSubmittedAnalysis(null);
            }}
          >
            결과 보기
          </ToastAction>
        )
      });
      setAnalysisState("IDLE");
    } else if (analysisState === "ERROR") {
      dismissPendingToast();
      toast({
        title: errorMessage,
        description: "잠시 후 다시 시도해주세요.",
        variant: "error",
        position: "top-center"
      });
      setAnalysisState("IDLE");
      setSubmittedAnalysis(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisState]);

  return (
    <ResumeAnalysisStore.Provider value={{ analysisState, submittedAnalysis }}>
      {children}
    </ResumeAnalysisStore.Provider>
  );
}

/** 분석 진행 상태를 읽어 중복 제출을 막는 등의 용도로 사용 */
export function useResumeAnalysisStore(): IResumeAnalysisStore {
  return (
    useContext(ResumeAnalysisStore) ?? {
      analysisState: "IDLE",
      submittedAnalysis: null
    }
  );
}
