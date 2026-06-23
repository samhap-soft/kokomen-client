import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { JSX } from "react";
import { cn } from "../../utils/index.ts";

interface PostingContentProps {
  content: string;
  className?: string;
}

/**
 * 공지/포스팅용 마크다운 렌더러.
 * 이미지, 링크(버튼 형태), 제목 등을 팝업에 맞는 스타일로 렌더한다.
 */
export default function PostingContent({
  content,
  className
}: PostingContentProps): JSX.Element {
  return (
    <div className={cn("text-text-primary", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => (
            <img
              src={typeof src === "string" ? src : ""}
              alt={alt ?? ""}
              className="mb-4 w-full rounded-lg object-cover"
            />
          ),
          h1: ({ children }) => (
            <h1 className="mb-3 text-2xl font-bold text-text-heading">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 text-xl font-semibold text-text-heading">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-lg font-semibold text-text-heading">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-text-secondary last:mb-0">
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
          strong: ({ children }) => (
            <strong className="font-semibold text-text-primary">
              {children}
            </strong>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="my-2 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {children}
            </a>
          )
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
