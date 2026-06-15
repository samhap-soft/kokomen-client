import Editor from "@monaco-editor/react";
import { cn } from "../../../utils";

interface LiveCodingEditorProps {
  defaultCode?: string;
  language: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function LiveCodingEditor({
  defaultCode = "",
  language,
  onChange,
  className,
}: LiveCodingEditorProps) {
  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden rounded-lg border border-border-secondary", className)}>
      <Editor
        defaultValue={defaultCode}
        language={language}
        theme="vs-dark"
        onChange={(value) => onChange?.(value ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 16 },
          lineNumbers: "on",
          tabSize: 2,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
