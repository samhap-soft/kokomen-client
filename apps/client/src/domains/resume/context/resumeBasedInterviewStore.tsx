import { checkResumeBasedInterviewQuestion } from "@/domains/resume/api/resumeBasedInterview";
import { useResumeBasedInterviewEvent } from "@/domains/resume/utils/resumeInterviewEventEmitter";
import { RoundSpinner, Tooltip } from "@kokomen/ui";
import { CheckIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import React, { createContext, useState } from "react";

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
}) {
  const [interviewState, setInterviewState] =
    useState<ResumeBasedInterviewState>("IDLE");
  const [interviewResultId, setInterviewResultId] = useState<number | null>(
    null
  );

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

  return (
    <ResumeBasedInterviewStore.Provider
      value={{ interviewState, interviewResultId, setInterviewResultId }}
    >
      <AnimatePresence>
        {interviewState === "PENDING" && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-24 right-6"
          >
            <Tooltip className="rounded-full p-4 bg-primary-3 text-primary-text">
              <Tooltip.Content placement="top">
                면접 질문 생성 중...
              </Tooltip.Content>
              <RoundSpinner />
            </Tooltip>
          </motion.div>
        )}
        {interviewState === "COMPLETED" && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-24 right-6"
            onClick={() => {
              setInterviewState("IDLE");
              setInterviewResultId(null);
            }}
          >
            <Tooltip className="rounded-full p-4 bg-primary-3 text-primary-text">
              <Link href={`/resume/interview/${interviewResultId}`}>
                <Tooltip.Content placement="top">
                  면접 질문 생성 완료
                </Tooltip.Content>
                <CheckIcon className="w-6 h-6 text-primary" />
              </Link>
            </Tooltip>
          </motion.div>
        )}
        {interviewState === "ERROR" && (
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
                setInterviewState("IDLE");
                setInterviewResultId(null);
              }}
            >
              <Tooltip.Content placement="top">
                면접 질문 생성 중 <br /> 오류가 발생했어요
              </Tooltip.Content>
              <X className="w-6 h-6 text-primary" />
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </ResumeBasedInterviewStore.Provider>
  );
}
