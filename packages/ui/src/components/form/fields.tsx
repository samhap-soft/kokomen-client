import { CloudUpload } from "lucide-react";
import { Button } from "../button/index.tsx";
import { useRef, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "../../utils/index.ts";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 10MB
const FileField = ({
  register,
  label,
  required,
  error,
  hint,
  disabled,
  displayName
}: {
  register: UseFormRegisterReturn<string>;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
  displayName?: string;
}) => {
  const [fileName, setFileName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalError, setInternalError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalError("");
    if (
      e.target.files?.[0] instanceof File &&
      e.target.files?.[0]?.size > MAX_FILE_SIZE
    ) {
      setInternalError("파일 크기가 너무 큽니다. 10MB 이하로 업로드해주세요.");
      return;
    }
    setFileName(e.target.files?.[0]?.name || "");
    await register.onChange(e);
  };

  const setRef = (ref: HTMLInputElement) => {
    inputRef.current = ref;
    register.ref(ref);
  };

  return (
    <div className="space-y-2 flex-1">
      <label
        className={cn(
          "block text-sm font-medium text-text-heading",
          disabled && "cursor-not-allowed"
        )}
      >
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        {...register}
        ref={setRef}
        onChange={handleFileChange}
      />
      <Button
        variant={"none"}
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "w-full px-4 py-2.5 border border-border rounded-lg hover:bg-fill-secondary transition-colors text-left flex items-center justify-between group",
          disabled && "cursor-not-allowed"
        )}
        disabled={disabled}
      >
        <span className={fileName ? "text-text-heading" : "text-text-tertiary"}>
          {displayName || fileName || "파일 선택하기"}
        </span>
        <CloudUpload className="w-5 h-5 text-text-tertiary group-hover:text-text-secondary transition-colors" />
      </Button>
      {hint && <p className="text-xs text-text-tertiary">{hint}</p>}
      {error && <p className="text-xs text-error">{error}</p>}
      {internalError && <p className="text-xs text-error">{internalError}</p>}
    </div>
  );
};
export { FileField };
