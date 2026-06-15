import { useState, useCallback, useRef } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../../utils";
import { Button } from "../../button";
import LiveCodingTimer from "./liveCodingTimer";
import LiveCodingProblem from "./liveCodingProblem";
import LiveCodingEditor from "./liveCodingEditor";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
] as const;

export interface LiveCodingTestProps {
  problemMarkdown: string;
  timeLimitSeconds?: number;
  defaultCode?: string;
  language?: string;
  onSubmit: (payload: { code: string }) => void;
  isOpen: boolean;
  onClose: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function LiveCodingTest({
  problemMarkdown,
  timeLimitSeconds = 600,
  defaultCode = "",
  language = "javascript",
  onSubmit,
  isOpen,
  onClose,
  isSubmitting = false,
  className,
}: LiveCodingTestProps) {
  const [code, setCode] = useState(defaultCode);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isProblemCollapsed, setIsProblemCollapsed] = useState(false);
  const hasSubmittedRef = useRef(false);

  const handleSubmit = useCallback(() => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    onSubmit({ code });
  }, [code, onSubmit]);

  const handleTimeUp = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-bg-base",
        className
      )}
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border-secondary px-4 py-3 md:px-6">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
        >
          <X size={18} />
          <span className="text-sm">닫기</span>
        </button>

        <LiveCodingTimer
          totalSeconds={timeLimitSeconds}
          isRunning={true}
          onTimeUp={handleTimeUp}
        />
      </header>

      {/* Body */}
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Left Panel - Problem */}
        <div
          className={cn(
            "border-b border-border-secondary md:border-b-0 md:border-r",
            "md:w-2/5",
            isProblemCollapsed ? "h-auto" : "h-1/3 md:h-auto"
          )}
        >
          {/* Mobile collapse toggle */}
          <button
            onClick={() => setIsProblemCollapsed(!isProblemCollapsed)}
            className="flex w-full items-center justify-between bg-bg-elevated px-4 py-2 text-sm text-text-secondary md:hidden"
          >
            <span>문제 설명</span>
            {isProblemCollapsed ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </button>

          {!isProblemCollapsed && (
            <LiveCodingProblem
              markdownContent={problemMarkdown}
              className="h-full"
            />
          )}
        </div>

        {/* Right Panel - Editor */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Language selector */}
          <div className="flex items-center border-b border-border-secondary px-4 py-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="rounded-md border border-border-secondary bg-bg-elevated px-3 py-1.5 text-sm text-text-primary outline-none focus:border-primary"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Editor */}
          <LiveCodingEditor
            defaultCode={defaultCode}
            language={selectedLanguage}
            onChange={setCode}
            className="m-4 flex-1"
          />

          {/* Submit */}
          <div className="border-t border-border-secondary px-4 py-3">
            <Button
              variant="primary"
              size="large"
              onClick={handleSubmit}
              disabled={isSubmitting}
              pendingSpinner={isSubmitting}
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
