import { useSubmitInterviewAnswer } from "@/domains/interview/hooks/useSubmitInterviewAnswer";
import {
  clearAnswerDraft,
  readAnswerDraft,
  useAnswerDraft
} from "@/domains/interview/hooks/useAnswerDraft";
import { Interview, InterviewerEmotion, InterviewMode } from "@kokomen/types";
import { Button, Textarea } from "@kokomen/ui";
import { LiveCodingEditor, LiveCodingProblem } from "@kokomen/ui/domains";
import React, { JSX, useCallback, useState } from "react";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" }
] as const;

type LiveCodingDraft = {
  language: string;
  code: string;
  explanation: string;
};

const buildAnswer = (
  explanation: string,
  language: string,
  code: string
): string => {
  const trimmed = explanation.trim();
  if (!code.trim()) return trimmed;
  const codeBlock = `\`\`\`${language}\n${code}\n\`\`\``;
  return trimmed ? `${trimmed}\n\n${codeBlock}` : codeBlock;
};

type UseLiveCodingAnswerOptions = {
  interviewId: number | string;
  isInterviewStarted: boolean;
  isFinished: boolean;
  cur_question: string;
  cur_question_id: number;
  prev_questions_and_answers: Interview["prev_questions_and_answers"];
  // eslint-disable-next-line no-unused-vars
  updateInterviewData: (updates: Partial<Interview>) => void;
  setInterviewerEmotion: React.Dispatch<
    React.SetStateAction<InterviewerEmotion>
  >;
  // eslint-disable-next-line no-unused-vars
  playAudio: (audioUrl?: string) => Promise<void>;
};

/**
 * 라이브 코딩 답변 상태. 예전 LiveCodingOverlay 의 동작을 면접실 작업 영역으로 옮겼다.
 * 제출 버튼은 조작 바에 있으므로 상태를 훅으로 꺼낸다.
 *
 * 꼬리질문에는 코드 없이 설명만 답할 수도 있다(예전에는 텍스트 입력창으로 따로 답했다).
 */
export function useLiveCodingAnswer({
  interviewId,
  isInterviewStarted,
  isFinished,
  cur_question,
  cur_question_id,
  prev_questions_and_answers,
  updateInterviewData,
  setInterviewerEmotion,
  playAudio
}: UseLiveCodingAnswerOptions) {
  const progressKey = `code:${cur_question_id}`;
  const [draft, setDraft] = useState<LiveCodingDraft>(
    () =>
      (typeof window !== "undefined" &&
        readAnswerDraft<LiveCodingDraft>(interviewId, progressKey)) || {
        language: "javascript",
        code: "",
        explanation: ""
      }
  );
  // 에디터는 defaultValue 로만 값을 받는다. 질문이 바뀌면 key 를 바꿔 새로 그린다
  const [editorGeneration, setEditorGeneration] = useState<number>(0);
  const [trackedQuestionId, setTrackedQuestionId] =
    useState<number>(cur_question_id);
  if (trackedQuestionId !== cur_question_id) {
    setTrackedQuestionId(cur_question_id);
    setDraft((prev) => ({ ...prev, code: "", explanation: "" }));
    setEditorGeneration((prev) => prev + 1);
  }

  const canSubmit =
    draft.code.trim().length > 0 || draft.explanation.trim().length > 0;

  const { isSaved: isDraftSaved } = useAnswerDraft({
    interviewId,
    progressKey,
    value: draft,
    isEmpty: !canSubmit,
    enabled: isInterviewStarted && !isFinished
  });

  const { mutate, isPending } = useSubmitInterviewAnswer({
    cur_question,
    cur_question_id,
    prev_questions_and_answers,
    updateInterviewData,
    setInterviewerEmotion,
    playAudio,
    onAnswerSubmitted: () => {
      clearAnswerDraft(interviewId);
    }
  });

  const submit = useCallback(() => {
    if (!isInterviewStarted || isPending || isFinished || !canSubmit) return;
    mutate({
      interviewId,
      questionId: cur_question_id,
      answer: buildAnswer(draft.explanation, draft.language, draft.code),
      mode: "TEXT" as InterviewMode
    });
  }, [
    isInterviewStarted,
    isPending,
    isFinished,
    canSubmit,
    mutate,
    interviewId,
    cur_question_id,
    draft
  ]);

  return {
    draft,
    setLanguage: (language: string) =>
      setDraft((prev) => ({ ...prev, language })),
    setCode: (code: string) => setDraft((prev) => ({ ...prev, code })),
    setExplanation: (explanation: string) =>
      setDraft((prev) => ({ ...prev, explanation })),
    editorKey: `${cur_question_id}-${editorGeneration}`,
    canSubmit,
    isPending,
    isDraftSaved,
    isDisabled: !isInterviewStarted || isPending || isFinished,
    submit
  };
}

export type LiveCodingAnswerController = ReturnType<typeof useLiveCodingAnswer>;

/**
 * 라이브 코딩 작업 영역. lg 이상에서는 문제(왼쪽 2/5)와 에디터를 나란히,
 * 그보다 좁으면 문제를 접을 수 있게 위에 두고 에디터를 아래에 둔다.
 */
export function LiveCodingWorkspace({
  answer,
  problemMarkdown
}: {
  answer: LiveCodingAnswerController;
  problemMarkdown: string;
}): JSX.Element {
  const [isProblemOpen, setIsProblemOpen] = useState<boolean>(true);

  return (
    <div className="flex flex-1 flex-col gap-3 lg:min-h-0 lg:flex-row">
      <section
        aria-label="문제"
        className="flex flex-col overflow-hidden rounded-xl bg-bg-base lg:w-2/5 lg:min-h-0"
      >
        <button
          type="button"
          onClick={() => setIsProblemOpen((prev) => !prev)}
          aria-expanded={isProblemOpen}
          className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-text-secondary lg:hidden"
        >
          문제 / 면접관 질문
          <span aria-hidden="true">{isProblemOpen ? "접기" : "펼치기"}</span>
        </button>
        <div
          className={`${isProblemOpen ? "block" : "hidden"} max-h-[40vh] overflow-y-auto lg:block lg:max-h-none lg:flex-1`}
        >
          <LiveCodingProblem markdownContent={problemMarkdown} className="h-full" />
        </div>
      </section>
      <section
        aria-label="코드 작성"
        className="flex min-h-[420px] flex-1 flex-col gap-3 lg:min-h-0"
      >
        <div className="flex items-center justify-between gap-2">
          <select
            value={answer.draft.language}
            onChange={(event) => answer.setLanguage(event.target.value)}
            className="rounded-lg border border-border bg-bg-base px-3 py-1.5 text-sm text-text-primary outline-none focus:border-primary"
            aria-label="programming-language"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          {answer.isDraftSaved && (
            <span aria-live="polite" className="text-sm text-text-secondary">
              초안 자동 저장됨
            </span>
          )}
        </div>
        <LiveCodingEditor
          key={answer.editorKey}
          language={answer.draft.language}
          defaultCode={answer.draft.code}
          onChange={answer.setCode}
          className="min-h-[260px] flex-1 lg:min-h-40"
        />
        <Textarea
          name="live-coding-explanation"
          aria-label="live-coding-explanation"
          variant={"default"}
          className="block max-h-[160px] w-full resize-none"
          rows={2}
          value={answer.draft.explanation}
          onChange={(event) => answer.setExplanation(event.target.value)}
          placeholder="풀이 의도나 설명을 적어주세요. 꼬리질문에는 설명만 적어도 돼요."
          disabled={answer.isDisabled}
        />
      </section>
    </div>
  );
}

/** 조작 바 오른쪽 "작성 완료" 버튼 */
export function LiveCodingSubmitButton({
  answer
}: {
  answer: LiveCodingAnswerController;
}): JSX.Element {
  return (
    <Button
      type="button"
      variant="primary"
      size="large"
      onClick={answer.submit}
      disabled={answer.isDisabled || !answer.canSubmit}
      pendingSpinner={answer.isPending}
      className="min-w-32 md:min-w-48"
    >
      작성 완료
    </Button>
  );
}
