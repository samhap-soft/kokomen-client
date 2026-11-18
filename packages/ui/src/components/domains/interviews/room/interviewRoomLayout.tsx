import { JSX, ReactNode } from "react";
import { cn } from "../../../../utils";

/**
 * - split: 텍스트 면접. 왼쪽 영상 패널 + 오른쪽 질문 · 답변 (Figma 1172:2426)
 * - focus: 음성 면접. 내 카메라를 크게, 면접관은 위에 작게 (Figma 1172:2473)
 * - stage: 라이브 코딩 · 시스템 설계. 작업 영역을 넓게 쓰고 영상은 작은 타일로 줄인다
 *          (Google Meet 의 발표 모드와 같은 배치. Figma 시안은 없다)
 */
export type InterviewRoomLayoutVariant = "split" | "focus" | "stage";

export interface InterviewRoomLayoutProps {
  variant: InterviewRoomLayoutVariant;
  header: ReactNode;
  interviewerTile: ReactNode;
  selfTile: ReactNode;
  workspace: ReactNode;
  controls: ReactNode;
  /** 헤더 위 안내(데모 면접 등) */
  banner?: ReactNode;
  className?: string;
}

/**
 * 면접실 공통 레이아웃.
 *
 * lg 이상에서는 화면 높이에 맞춰 스크롤 없이 배치하고, 작업 영역이 남은 높이를 채운다.
 * 그보다 좁으면 페이지 스크롤을 허용하고 조작 바를 화면 아래에 붙인다.
 */
export function InterviewRoomLayout({
  variant,
  header,
  interviewerTile,
  selfTile,
  workspace,
  controls,
  banner,
  className
}: InterviewRoomLayoutProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col bg-bg-base lg:h-dvh lg:min-h-[640px]",
        className
      )}
    >
      {banner}
      <div
        className={cn(
          "mx-auto flex w-full flex-1 flex-col gap-4 px-4 pt-4 sm:px-6 md:gap-5 md:pt-6 lg:min-h-0 lg:px-8",
          variant === "focus" ? "max-w-[1164px]" : "max-w-[1744px]"
        )}
      >
        {header}
        <main className="flex flex-1 flex-col gap-4 lg:min-h-0 lg:gap-6">
          {variant === "split" && (
            <SplitBody
              interviewerTile={interviewerTile}
              selfTile={selfTile}
              workspace={workspace}
            />
          )}
          {variant === "focus" && (
            <FocusBody
              interviewerTile={interviewerTile}
              selfTile={selfTile}
              workspace={workspace}
            />
          )}
          {variant === "stage" && (
            <StageBody
              interviewerTile={interviewerTile}
              selfTile={selfTile}
              workspace={workspace}
            />
          )}
        </main>
        <div className="sticky bottom-0 z-30 -mx-4 border-t border-border bg-bg-base px-4 py-3 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-t-0 lg:px-0 lg:pt-2 lg:pb-6">
          {controls}
        </div>
      </div>
    </div>
  );
}

type BodyProps = Pick<
  InterviewRoomLayoutProps,
  "interviewerTile" | "selfTile" | "workspace"
>;

const tileLabelClassName: string =
  "hidden text-base font-semibold text-text-primary xl:block";

/**
 * xl 이상: Figma 처럼 576px 영상 패널(면접관 · 내 카메라 세로 배치) + 작업 패널.
 * md~xl: 영상 두 개를 위에 가로로 놓고 작업 패널을 아래에 둔다.
 * md 미만: 면접관 타일 위에 내 카메라를 작은 화면(PiP)으로 겹친다.
 *
 * xl 에서 화면 세로가 짧으면 타일 두 개가 패널 밖으로 넘친다. 그래서 칸(이름 + 타일)을 size 컨테이너로 두고,
 * 칸 너비를 "패널 너비"와 "(칸 높이 - 이름 줄) × 16/9" 중 작은 값으로 정한 뒤 가운데에 놓는다.
 * 칸 높이는 타일이 패널 너비만큼 다 컸을 때까지만 늘어나므로, 높이가 넉넉하면 Figma 와 같다.
 * lg~xl 은 영상이 위에 가로로 놓이므로, 타일 높이를 화면 높이의 30% 까지로 줄여 작업 패널 높이를 남긴다.
 * 그래도 모자라면 작업 패널 안에서 스크롤한다.
 */
const videoSlotClassName: string =
  "xl:min-h-0 xl:flex-1 xl:[container-type:size] xl:max-h-[calc((var(--video-column)-3rem)*9/16+2.25rem)]";
const videoSlotInnerClassName: string =
  "flex w-full flex-col gap-3 lg:max-xl:mx-auto lg:max-xl:max-w-[calc(30dvh*16/9)] xl:mx-auto xl:w-[min(100cqw,calc((100cqh-2.25rem)*16/9))]";

function SplitBody({
  interviewerTile,
  selfTile,
  workspace
}: BodyProps): JSX.Element {
  return (
    <div className="flex flex-1 flex-col gap-4 lg:min-h-0 xl:flex-row xl:gap-6">
      <section
        aria-label="영상"
        className="relative grid shrink-0 grid-cols-1 gap-3 md:grid-cols-2 md:rounded-2xl md:bg-bg-layout md:p-4 xl:flex xl:w-(--video-column) xl:flex-col xl:justify-center xl:gap-[30px] xl:p-6 xl:[--video-column:clamp(400px,30vw,576px)]"
      >
        <div className={videoSlotClassName}>
          <div className={videoSlotInnerClassName}>
            <p className={tileLabelClassName}>면접관</p>
            <div className="aspect-video w-full">{interviewerTile}</div>
          </div>
        </div>
        <div
          className={cn(
            "absolute right-2 bottom-2 z-10 w-[32%] max-w-40 md:static md:w-auto md:max-w-none",
            videoSlotClassName
          )}
        >
          <div className={videoSlotInnerClassName}>
            <p className={tileLabelClassName}>내 카메라</p>
            <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg ring-2 ring-bg-base md:shadow-none md:ring-0">
              {selfTile}
            </div>
          </div>
        </div>
      </section>
      <section
        aria-label="질문과 답변"
        className="flex min-w-0 flex-1 flex-col rounded-2xl bg-bg-layout p-4 md:p-6 lg:min-h-0 lg:overflow-y-auto xl:p-8"
      >
        {workspace}
      </section>
    </div>
  );
}

/**
 * 가운데 1100px 열에 작은 면접관 타일 → 큰 내 카메라 → 질문 · 녹음 상태를 쌓는다.
 * 높이가 부족하면 내 카메라가 줄어든다.
 */
function FocusBody({
  interviewerTile,
  selfTile,
  workspace
}: BodyProps): JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 lg:min-h-0">
      <div className="aspect-video w-32 shrink-0 md:w-[194px]">
        {interviewerTile}
      </div>
      <div className="flex w-full flex-1 items-center justify-center lg:min-h-0">
        <div className="aspect-video w-full max-w-full lg:h-full lg:w-auto">
          {selfTile}
        </div>
      </div>
      <div className="flex w-full shrink-0 flex-col gap-3">{workspace}</div>
    </div>
  );
}

/**
 * 작업 영역을 최대로 쓴다. xl 이상에서는 오른쪽에 작은 영상 열(240px),
 * 그보다 좁으면 위에 작은 영상 두 개를 가로로 놓는다.
 */
function StageBody({
  interviewerTile,
  selfTile,
  workspace
}: BodyProps): JSX.Element {
  return (
    <div className="flex flex-1 flex-col gap-3 lg:min-h-0 xl:flex-row-reverse xl:gap-4">
      <section
        aria-label="영상"
        className="flex shrink-0 gap-2 xl:w-60 xl:flex-col xl:gap-3"
      >
        <div className="aspect-video w-36 sm:w-44 xl:w-full">
          {interviewerTile}
        </div>
        <div className="aspect-video w-36 sm:w-44 xl:w-full">{selfTile}</div>
      </section>
      <section
        aria-label="작업 영역"
        className="flex min-w-0 flex-1 flex-col rounded-2xl bg-bg-layout p-3 md:p-4 lg:min-h-0 lg:overflow-y-auto"
      >
        {workspace}
      </section>
    </div>
  );
}
