import { useSubmitInterviewAnswer } from "@/domains/interview/hooks/useSubmitInterviewAnswer";
import type { InterviewerEmotion } from "@/pages/interviews/[interviewId]";
import { Interview, InterviewMode } from "@kokomen/types";
import { Button, Textarea } from "@kokomen/ui";
import { LiveCodingEditor, LiveCodingProblem } from "@kokomen/ui/domains";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import React, { JSX, useState } from "react";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" }
] as const;

type LiveCodingOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  isInterviewStarted: boolean;
  cur_question: string;
  cur_question_id: number;
  prev_questions_and_answers: Interview["prev_questions_and_answers"];
  // eslint-disable-next-line no-unused-vars
  updateInterviewData: (updates: Partial<Interview>) => void;
  interviewId: number | string;
  totalQuestions: number;
  setInterviewerEmotion: React.Dispatch<
    React.SetStateAction<InterviewerEmotion>
  >;
  // eslint-disable-next-line no-unused-vars
  playAudio: (audioUrl?: string) => Promise<void>;
};

const buildAnswer = (
  explanation: string,
  language: string,
  code: string
): string => {
  const codeBlock = `\`\`\`${language}\n${code}\n\`\`\``;
  const trimmed = explanation.trim();
  return trimmed ? `${trimmed}\n\n${codeBlock}` : codeBlock;
};

export function LiveCodingOverlay({
  isOpen,
  onClose,
  isInterviewStarted,
  cur_question,
  cur_question_id,
  prev_questions_and_answers,
  updateInterviewData,
  interviewId,
  totalQuestions,
  setInterviewerEmotion,
  playAudio
}: LiveCodingOverlayProps): JSX.Element | null {
  const [language, setLanguage] = useState<string>("javascript");
  const [code, setCode] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [isProblemCollapsed, setIsProblemCollapsed] = useState<boolean>(false);

  const { mutate, isPending } = useSubmitInterviewAnswer({
    cur_question,
    cur_question_id,
    prev_questions_and_answers,
    updateInterviewData,
    setInterviewerEmotion,
    playAudio,
    onAnswerSubmitted: () => {
      setExplanation("");
      onClose();
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (): void => {
    if (!isInterviewStarted || isPending) return;
    if (!code.trim()) return;
    mutate({
      interviewId,
      questionId: cur_question_id,
      answer: buildAnswer(explanation, language, code),
      mode: "TEXT" as InterviewMode
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg-base">
      <header className="flex items-center justify-between border-b border-border-secondary px-4 py-3 md:px-6">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
          aria-label="close-live-coding"
        >
          <X size={18} />
          <span className="text-sm">닫기</span>
        </button>
        <span className="text-text-tertiary font-bold text-sm">
          {prev_questions_and_answers.length} / {totalQuestions}
        </span>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <div
          className={
            "border-b border-border-secondary md:border-b-0 md:border-r md:w-2/5 " +
            (isProblemCollapsed ? "h-auto" : "h-1/3 md:h-auto")
          }
        >
          <button
            type="button"
            onClick={() => setIsProblemCollapsed(!isProblemCollapsed)}
            className="flex w-full items-center justify-between bg-bg-elevated px-4 py-2 text-sm text-text-secondary md:hidden"
          >
            <span>문제 / 면접관 질문</span>
            {isProblemCollapsed ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </button>

          {!isProblemCollapsed && (
            <LiveCodingProblem
              markdownContent={cur_question}
              className="h-full"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border-secondary px-4 py-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-md border border-border-secondary bg-bg-elevated px-3 py-1.5 text-sm text-text-primary outline-none focus:border-primary"
              aria-label="programming-language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <LiveCodingEditor
            language={language}
            onChange={setCode}
            className="m-4 flex-1 min-h-[200px]"
          />

          <div className="border-t border-border-secondary px-4 py-3 space-y-3">
            <Textarea
              name="live-coding-explanation"
              aria-label="live-coding-explanation"
              variant={"default"}
              border={"default"}
              className="block w-full resize-none max-h-[200px]"
              rows={3}
              autoAdjust
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="풀이 의도나 설명을 적어주세요. (선택)"
              disabled={isPending || !isInterviewStarted}
            />
            <Button
              type="button"
              variant="primary"
              size="large"
              onClick={handleSubmit}
              disabled={!isInterviewStarted || isPending || !code.trim()}
              pendingSpinner={isPending}
              className="w-full"
            >
              작성완료
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveCodingOverlay;
