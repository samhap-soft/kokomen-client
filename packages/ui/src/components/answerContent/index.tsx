import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { JSX } from "react";
import { cn } from "../../utils/index.ts";

interface AnswerContentProps {
  content: string;
  className?: string;
  /** false이면 코드 블럭 마크다운 파싱을 건너뛰고 plain text로만 렌더 */
  parseCode?: boolean;
  /**
   * true이면 인라인(버튼/제목 등) 컨텍스트에 안전하게 렌더한다.
   * 블럭 요소(`<p>`/`<pre>`) 없이 `<span>` 기반으로 마크다운을 파싱한다.
   */
  inline?: boolean;
}

const containsCodeBlock = (text: string): boolean => /```[\s\S]*?```/.test(text);

/**
 * 마크다운에서 제목을 추출한다.
 * 1순위: 첫 번째 heading(`#`~`######`)
 * 2순위: 첫 번째 비어있지 않은 줄(마크다운 기호 제거 후 최대 60자)
 */
export const extractMarkdownTitle = (text: string): string => {
  const lines = text.split("\n").map((line) => line.trim());
  const heading = lines.find((line) => /^#{1,6}\s+/.test(line));
  if (heading) return heading.replace(/^#{1,6}\s+/, "").trim();
  const firstLine = lines.find(Boolean) ?? "질문";
  return firstLine.replace(/[*_`#>]/g, "").slice(0, 60);
};

export const stripCodeBlocksForPreview = (text: string): string => {
  return text
    .replace(/```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g, (_, code) => {
      const firstLine = String(code).trim().split("\n")[0] ?? "";
      return firstLine ? `[코드: ${firstLine.slice(0, 40)}…]` : "[코드]";
    })
    .replace(/\s+/g, " ")
    .trim();
};

export default function AnswerContent({
  content,
  className,
  parseCode = true,
  inline = false
}: AnswerContentProps): JSX.Element {
  // 인라인(버튼/제목) 컨텍스트: 블럭 요소 없이 span 기반으로 마크다운 렌더
  if (inline) {
    return (
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <span>{children}</span>,
          // 코드 블럭/인라인 코드 모두 인라인 코드 스타일로 표시
          pre: ({ children }) => <>{children}</>,
          code: ({ children }) => (
            <code className="rounded bg-fill-secondary px-1.5 py-0.5 font-mono text-[0.9em]">
              {children}
            </code>
          )
        }}
      >
        {content}
      </Markdown>
    );
  }

  if (!parseCode || !containsCodeBlock(content)) {
    return (
      <p
        className={cn(
          "text-text-primary leading-relaxed whitespace-pre-wrap break-words",
          className
        )}
      >
        {content}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "text-text-primary leading-relaxed break-words",
        className
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-3 whitespace-pre-wrap last:mb-0">{children}</p>
          ),
          code: ({ children, className: codeClassName }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code className="rounded bg-fill-secondary px-1.5 py-0.5 font-mono text-sm">
                  {children}
                </code>
              );
            }
            const language = codeClassName?.replace("language-", "");
            return (
              <code
                className="font-mono text-sm block"
                data-language={language}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-lg bg-gray-900 text-gray-100 p-4 font-mono text-sm leading-relaxed border border-border-secondary">
              {children}
            </pre>
          )
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
