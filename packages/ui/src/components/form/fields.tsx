import { CloudUpload } from "lucide-react";
import { Button } from "../button/index.tsx";
import { useRef, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

const FileField = ({
  register,
  label,
  required,
  error,
  hint
}: {
  register: UseFormRegisterReturn<string>;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}) => {
  const [fileName, setFileName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.files?.[0]?.name || "");
    register.onChange(e);
  };

  const setRef = (ref: HTMLInputElement) => {
    inputRef.current = ref;
    register.ref(ref);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-heading">
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
        className="w-full px-4 py-2.5 border border-border rounded-lg hover:bg-fill-secondary transition-colors text-left flex items-center justify-between group"
      >
        <span className={fileName ? "text-text-heading" : "text-text-tertiary"}>
          {fileName || "파일 선택하기"}
        </span>
        <CloudUpload className="w-5 h-5 text-text-tertiary group-hover:text-text-secondary transition-colors" />
      </Button>
      {hint && <p className="text-xs text-text-tertiary">{hint}</p>}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
};
export { FileField };
