import type { SystemDesignTopic } from "@kokomen/types";
import { JSX, ReactNode } from "react";

export interface SystemDesignWorkspaceProps {
  topic: SystemDesignTopic;
  /** 난이도 배지 등 주제 옆에 붙일 내용 */
  topicMeta?: ReactNode;
  stepper: ReactNode;
  /** 요구사항 단계는 역질문 패널, 설계 단계는 현재 질문 + 텍스트 답변 */
  sidePanel: ReactNode;
  /** 다이어그램 에디터 */
  editor: ReactNode;
}

/**
 * 시스템 설계 면접의 작업 영역. 면접실 레이아웃의 stage 변형 안에 들어간다.
 *
 * lg 이상: 왼쪽 400px 에 주제 · 단계 · 질문/답변, 오른쪽에 다이어그램.
 * md~lg: 위에 주제 · 질문, 아래에 다이어그램을 쌓는다.
 * md 미만: 다이어그램 편집이 어려워 안내만 보여준다(질문 · 답변 패널은 남긴다).
 */
export function SystemDesignWorkspace({
  topic,
  topicMeta,
  stepper,
  sidePanel,
  editor
}: SystemDesignWorkspaceProps): JSX.Element {
  return (
    <div className="flex flex-1 flex-col gap-3 lg:min-h-0 lg:flex-row lg:gap-4">
      <div className="flex shrink-0 flex-col gap-3 lg:w-[400px] lg:min-h-0 lg:overflow-y-auto">
        <div className="flex flex-col gap-2 rounded-xl bg-bg-base p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-text-secondary">
              설계 주제
            </span>
            {topicMeta}
          </div>
          <h2 className="text-lg font-bold break-keep text-text-primary md:text-xl">
            {topic.title}
          </h2>
          <p className="text-sm break-keep text-text-secondary">
            {topic.description}
          </p>
        </div>
        <div className="overflow-x-auto">{stepper}</div>
        <div className="flex min-h-[280px] flex-1 flex-col lg:min-h-0">
          {sidePanel}
        </div>
      </div>
      <div className="hidden min-h-[480px] flex-1 flex-col md:flex lg:min-h-0">
        {editor}
      </div>
      <p className="rounded-xl bg-bg-base p-4 text-sm text-text-secondary md:hidden">
        다이어그램은 화면이 넓은 태블릿이나 PC에서 그릴 수 있어요. 지금은 텍스트로만
        답변할 수 있어요.
      </p>
    </div>
  );
}
