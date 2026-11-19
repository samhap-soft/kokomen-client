import { JSX, ReactNode } from "react";
import { cn } from "../../../../utils";

export interface VideoTileProps {
  /** 타일 왼쪽 아래에 겹쳐 쓰는 이름. 예: "AI 면접관" */
  label?: string;
  /** 타일 아래 가운데의 상태 표시. 예: "나 · 카메라 켜짐" */
  status?: string;
  /** 말하는 중이면 테두리를 강조한다 */
  isActive?: boolean;
  /** 영상이 없을 때 보여줄 내용. children 이 없을 때만 쓴다 */
  placeholder?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Figma: "AI 면접관 · 상단 작은 영상"(1172:2441), "나의 카메라 · 메인 영상"(1172:2447)
 *
 * 영상(3D 면접관 캔버스, 카메라 video)을 담는 둥근 타일이다. 크기와 비율은
 * 부모 레이아웃이 정하고, 타일은 그 안을 꽉 채운다.
 */
export function VideoTile({
  label,
  status,
  isActive = false,
  placeholder,
  children,
  className
}: VideoTileProps): JSX.Element {
  return (
    <div
      className={cn(
        "relative isolate h-full w-full overflow-hidden rounded-xl bg-gray-9 ring-2 ring-transparent transition-shadow",
        isActive && "ring-primary",
        className
      )}
    >
      <div className="absolute inset-0">
        {children ?? (
          <div className="flex h-full w-full items-center justify-center text-sm text-text-light-solid/80">
            {placeholder}
          </div>
        )}
      </div>
      {label && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-black/60" />
          <span className="pointer-events-none absolute bottom-2 left-3 text-sm font-semibold text-text-light-solid md:bottom-3 md:left-3.5 md:text-base">
            {label}
          </span>
        </>
      )}
      {status && (
        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg bg-gray-10/90 px-3 py-1.5 text-sm whitespace-nowrap text-text-light-solid md:bottom-6">
          {status}
        </span>
      )}
    </div>
  );
}
