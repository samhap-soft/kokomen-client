import { Textarea } from "@kokomen/ui/components/textarea/textarea";
import { ChangeEventHandler, useRef } from "react";
export function InterviewInput({
  value,
  onChange,
  placeholder = "답변을 입력하세요...",
}: {
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <Textarea
      variant={"default"}
      name="interview-input"
      border={"none"}
      value={value}
      onChange={onChange}
      className="transition-all block w-full resize-none border-none focus:border-none r"
      ref={inputRef}
      rows={1}
      autoAdjust={true}
      placeholder={placeholder}
    />
  );
}
