import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../../utils";

interface LiveCodingProblemProps {
  markdownContent: string;
  className?: string;
}

export default function LiveCodingProblem({
  markdownContent,
  className,
}: LiveCodingProblemProps) {
  return (
    <div
      className={cn(
        "overflow-y-auto p-6 text-text-primary",
        className
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 text-2xl font-bold text-text-heading">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-xl font-semibold text-text-heading">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-lg font-medium text-text-heading">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-text-secondary">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 ml-4 list-disc space-y-1 text-text-secondary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 ml-4 list-decimal space-y-1 text-text-secondary">
              {children}
            </ol>
          ),
          code: ({ children, className: codeClassName }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-sm text-text-primary">
                  {children}
                </code>
              );
            }
            return (
              <code className="font-mono text-sm">{children}</code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-4 overflow-x-auto rounded-lg bg-bg-elevated p-4 font-mono text-sm">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <table className="mb-4 w-full border-collapse text-sm">
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th className="border border-border-secondary bg-bg-elevated px-3 py-2 text-left font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border-secondary px-3 py-2">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-4 border-primary pl-4 italic text-text-tertiary">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-text-primary">
              {children}
            </strong>
          ),
        }}
      >
        {markdownContent}
      </Markdown>
    </div>
  );
}
