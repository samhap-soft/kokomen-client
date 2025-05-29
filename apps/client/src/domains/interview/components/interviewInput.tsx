import { Button } from "@/components/button/Button";
import { useInterviewContext } from "@/domains/interview/components/interviewProvider";
import { Textarea } from "@kokomen/ui/components/textarea/textarea";
import { ArrowBigUp } from "lucide-react";
import { ChangeEventHandler, RefObject, useRef, useState } from "react";

export function InterviewAnswerInput() {
  const [interviewInput, setInterviewInput] = useState<string>("");
  const { status, answerQuestion } = useInterviewContext();
  const handleClick = async () => {
    const inputValue = interviewInput;
    setInterviewInput("");
    try {
      await answerQuestion(inputValue || "");
    } catch {
      setInterviewInput(inputValue);
    }
  };

  return (
    <div className="absolute z-20 bottom-10 gap-3 p-4 items-center w-3/4 left-[10%] border border-border-input rounded-xl bg-background-base ">
      <AnswerInput
        onChange={(e) => setInterviewInput(e.target.value)}
        value={interviewInput}
      />
      <div className="flex w-full gap-5">
        <div className="flex-1"></div>
        <Button
          shadow={"none"}
          border={"round"}
          className={`w-[50px] h-[50px] disabled:opacity-50 disabled:pointer-events-none transition-opacity duration-200`}
          disabled={status !== "question" || !interviewInput.length}
          onClick={() => handleClick()}
        >
          <ArrowBigUp className="text-primary-content" />
        </Button>
      </div>
    </div>
  );
}

export function AnswerInput({
  ref,
  placeholder = "답변을 입력하세요...",
  onChange,
  value,
}: {
  ref?: RefObject<HTMLTextAreaElement | null>;
  placeholder?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  value?: string;
}) {
  const { status } = useInterviewContext();

  return (
    <Textarea
      variant={"default"}
      name="interview-input"
      border={"none"}
      className={`transition-all block w-full resize-none border-none focus:border-none`}
      ref={ref}
      rows={1}
      onChange={onChange}
      value={value}
      autoAdjust={true}
      disabled={status !== "question"}
      placeholder={placeholder}
    />
  );
}
