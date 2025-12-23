import { getResumeEvaluationState } from "@/domains/resume/api";
import { useReportevent } from "@/domains/resume/utils/reportEventEmitter";
import { RoundSpinner, Tooltip } from "@kokomen/ui";
import { CheckIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import React, { createContext, useState } from "react";

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
}) {
  const [reportState, setReportState] = useState<ResumeState>("IDLE");
  const [evaluationId, setEvaluationId] = useState<string | null>(null);

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
  return (
    <ResumeStore.Provider
      value={{ reportState, evaluationId, setEvaluationId }}
    >
      <AnimatePresence>
        {reportState === "PENDING" && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-24 right-6"
          >
            <Tooltip className="rounded-full p-4 bg-primary-3 text-primary-text">
              <Tooltip.Content placement="top">
                이력서 평가 중...
              </Tooltip.Content>
              <RoundSpinner />
            </Tooltip>
          </motion.div>
        )}
        {reportState === "COMPLETED" && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-24 right-6"
            onClick={() => {
              setReportState("IDLE");
              setEvaluationId(null);
            }}
          >
            <Tooltip className="rounded-full p-4 bg-primary-3 text-primary-text">
              <Link href={`/resume/eval/${evaluationId}/result`}>
                <Tooltip.Content placement="top">
                  이력서 평가 완료
                </Tooltip.Content>
                <CheckIcon className="w-6 h-6 text-primary" />
              </Link>
            </Tooltip>
          </motion.div>
        )}
        {reportState === "ERROR" && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-24 right-6"
          >
            <Tooltip
              className="rounded-full p-4 bg-primary-3 text-primary-text"
              onClick={() => {
                setReportState("IDLE");
                setEvaluationId(null);
              }}
            >
              <Tooltip.Content placement="top">
                이력서 평가 중 <br /> 오류가 발생했어요
              </Tooltip.Content>
              <X className="w-6 h-6 text-primary" />
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </ResumeStore.Provider>
  );
}
