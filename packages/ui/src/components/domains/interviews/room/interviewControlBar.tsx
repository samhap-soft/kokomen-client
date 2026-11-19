import { JSX, ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../../../../utils";
import { Button } from "../../../button";
import { MenuIcon } from "../../../icon";

export interface InterviewControlAction {
  id: string;
  label: string;
  /** 있으면 아이콘 버튼으로 그리고 label 은 접근성 이름으로만 쓴다 */
  icon?: ReactNode;
  onClick: () => void;
  /** 켜고 끄는 버튼의 현재 상태. aria-pressed 로 노출한다 */
  pressed?: boolean;
  disabled?: boolean;
}

export interface InterviewControlBarProps {
  actions: InterviewControlAction[];
  /** 오른쪽 끝 주요 버튼(답변 제출 등) */
  primaryAction?: ReactNode;
  className?: string;
}

const iconButtonClassName: string = "size-12 p-0 md:size-14";

/**
 * Figma: "면접 조작 및 모드 변경"(1172:2463)
 *
 * 아이콘 버튼(설정 · 마이크 · 카메라)은 항상 보인다.
 * 글자 버튼은 md 이상에서만 늘어놓고, 그보다 좁으면 Google Meet 처럼 "더보기" 메뉴로 묶는다.
 */
export function InterviewControlBar({
  actions,
  primaryAction,
  className
}: InterviewControlBarProps): JSX.Element {
  const iconActions = actions.filter((action) => action.icon);
  const textActions = actions.filter((action) => !action.icon);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        {iconActions.map((action) => (
          <Button
            key={action.id}
            type="button"
            variant="secondary"
            aria-label={action.label}
            title={action.label}
            aria-pressed={action.pressed}
            disabled={action.disabled}
            onClick={action.onClick}
            className={cn(
              iconButtonClassName,
              action.pressed === false && "text-text-tertiary"
            )}
          >
            {action.icon}
          </Button>
        ))}
        {textActions.map((action) => (
          <Button
            key={action.id}
            type="button"
            variant="secondary"
            size="xl"
            aria-pressed={action.pressed}
            disabled={action.disabled}
            onClick={action.onClick}
            className="hidden lg:inline-flex"
          >
            {action.label}
          </Button>
        ))}
        {textActions.length > 0 && <OverflowMenu actions={textActions} />}
      </div>
      {primaryAction && <div className="shrink-0">{primaryAction}</div>}
    </div>
  );
}

function OverflowMenu({
  actions
}: {
  actions: InterviewControlAction[];
}): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent): void => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative lg:hidden">
      <Button
        type="button"
        variant="secondary"
        aria-label="더보기"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={iconButtonClassName}
      >
        <MenuIcon />
      </Button>
      {isOpen && (
        <ul
          role="menu"
          className="absolute bottom-full left-0 z-50 mb-2 flex min-w-48 flex-col rounded-xl border border-border bg-bg-base p-1.5 shadow-lg"
        >
          {actions.map((action) => (
            <li key={action.id} role="none">
              <button
                type="button"
                role="menuitem"
                aria-pressed={action.pressed}
                disabled={action.disabled}
                onClick={() => {
                  setIsOpen(false);
                  action.onClick();
                }}
                className="w-full rounded-lg px-3 py-2.5 text-left text-base font-medium whitespace-nowrap text-text-primary hover:bg-fill-tertiary disabled:text-text-disabled"
              >
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
