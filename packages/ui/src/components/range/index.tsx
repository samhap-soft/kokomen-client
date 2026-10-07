import { cn } from "../../utils";
import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import Tooltip from "../tooltip";

/**
 * Figma: Common/Range (완) — component set 55:952
 *
 * mode(single · dual) x state(default · disabled). 위에서 아래로
 * title(base/regular, onsurface/neutral) + 값(sm/regular, onsurface/neutral-label)
 * → track(h6, rounded-full, gray/400) → min·max 라벨(xs, onsurface/neutral-subtle)
 * 순서로 쌓인다. progress 는 surface/brand, disabled 에서는 gray/500 이다.
 * handle 은 24x24 흰 원 + shadow/md 이며 테두리는 없다.
 * track 은 cursor-pointer, handle 은 cursor-grab / active:cursor-grabbing 이고
 * hover 와 드래그 중에는 scale-110 이 걸린다.
 */
type RangeCommonProps = {
  min: number;
  max: number;
  className?: string;
  unit?: string;
  /** Figma 의 title 영역. 한 줄로만 표기되며, 하단에 현재 값이 함께 붙는다. */
  title?: string;
  disabled?: boolean;
  /** Figma 의 min·max 라벨. 호출부가 자체 라벨을 그릴 때만 끈다. */
  showBounds?: boolean;
};

export type RangeProps = RangeCommonProps &
  (
    | {
        defaultValue?: number;
        onChange?: (value: number) => void;
        dual?: false;
      }
    | {
        defaultValue?: [number, number];
        onChange?: (value: [number, number]) => void;
        dual: true;
      }
  );

export function Range(props: RangeProps) {
  const {
    min,
    max,
    className,
    title,
    disabled = false,
    showBounds = true
  } = props;
  const isDual = props.dual === true;
  const onChange = props.onChange;

  // 내부 state로 관리
  const [internalValue, setInternalValue] = useState<[number, number]>(() => {
    if (isDual) {
      return (props.defaultValue as [number, number]) || [min, max];
    } else {
      const value =
        (props.defaultValue as number) ?? Math.floor((min + max) / 2);
      return [min, value];
    }
  });

  const [draggingHandle, setDraggingHandle] = useState<
    null | "single" | "min" | "max"
  >(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [minValue, maxValue] = internalValue;

  const minPercentage = useMemo(() => {
    return ((minValue - min) / (max - min)) * 100;
  }, [minValue, max, min]);

  const maxPercentage = useMemo(() => {
    return ((maxValue - min) / (max - min)) * 100;
  }, [maxValue, max, min]);

  const updateInternalValue = useCallback(
    (clientX: number, handle: "single" | "min" | "max") => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newValue = Math.round(percentage * (max - min) + min);

      if (isDual) {
        const [currentMin, currentMax] = internalValue;
        if (handle === "min") {
          const clampedValue = Math.min(newValue, currentMax - 1);
          setInternalValue([clampedValue, currentMax]);
        } else if (handle === "max") {
          const clampedValue = Math.max(newValue, currentMin + 1);
          setInternalValue([currentMin, clampedValue]);
        }
      } else {
        setInternalValue([min, newValue]);
      }
    },
    [min, max, isDual, internalValue]
  );

  const handleMouseDown = (
    event: React.MouseEvent,
    handle: "single" | "min" | "max"
  ): void => {
    event.preventDefault();
    event.stopPropagation();
    setDraggingHandle(handle);
    updateInternalValue(event.clientX, handle);
  };

  const handleTouchStart = (
    event: React.TouchEvent,
    handle: "single" | "min" | "max"
  ): void => {
    event.stopPropagation();
    setDraggingHandle(handle);
    const touch = event.touches[0];
    if (touch) {
      updateInternalValue(touch.clientX, handle);
    }
  };

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (draggingHandle) {
        updateInternalValue(event.clientX, draggingHandle);
      }
    },
    [draggingHandle, updateInternalValue]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (draggingHandle) {
        const touch = event.touches[0];
        if (touch) {
          updateInternalValue(touch.clientX, draggingHandle);
        }
      }
    },
    [draggingHandle, updateInternalValue]
  );

  const handleMouseUp = useCallback(() => {
    if (draggingHandle && onChange) {
      // 마우스를 뗐을 때만 onChange 콜백 실행
      if (isDual) {
        (onChange as (value: [number, number]) => void)(internalValue);
      } else {
        (onChange as (value: number) => void)(internalValue[1]);
      }
    }
    setDraggingHandle(null);
  }, [draggingHandle, onChange, isDual, internalValue]);

  const handleTouchEnd = useCallback(() => {
    if (draggingHandle && onChange) {
      // 터치를 뗐을 때만 onChange 콜백 실행
      if (isDual) {
        (onChange as (value: [number, number]) => void)(internalValue);
      } else {
        (onChange as (value: number) => void)(internalValue[1]);
      }
    }
    setDraggingHandle(null);
  }, [draggingHandle, onChange, isDual, internalValue]);

  // 전역 마우스 및 터치 이벤트 리스너
  useEffect(() => {
    if (draggingHandle) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [draggingHandle, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const unit = props.unit ?? "";
  const handleClassName = cn(
    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-bg-base rounded-full p-0 shadow-md transition-transform z-10",
    disabled
      ? "cursor-not-allowed"
      : "cursor-grab active:cursor-grabbing hover:scale-110"
  );

  return (
    <div className={cn("w-full", className)}>
      {title && (
        <div className="mb-5">
          <p className="truncate text-base text-text-primary">{title}</p>
          <p className="text-sm text-text-label">
            {isDual
              ? `${minValue}${unit} ~ ${maxValue}${unit}`
              : `${maxValue}${unit}`}
          </p>
        </div>
      )}

      <div
        ref={trackRef}
        aria-label="range"
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={isDual ? minValue : maxValue}
        aria-disabled={disabled}
        className={cn(
          "relative h-1.5 w-full rounded-full bg-gray-4",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        {/* 진행 바 */}
        <div
          className={cn(
            "pointer-events-none absolute top-0 h-full rounded-full",
            disabled ? "bg-gray-5" : "bg-primary"
          )}
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`
          }}
        />

        {/* Min 핸들 (dual mode only) */}
        {isDual && (
          <Tooltip
            className={cn(
              handleClassName,
              draggingHandle === "min" && "scale-110"
            )}
            style={{ left: `${minPercentage}%` }}
            onMouseDown={(e) => !disabled && handleMouseDown(e, "min")}
            onTouchStart={(e) => !disabled && handleTouchStart(e, "min")}
          >
            <Tooltip.Content>
              <p>
                {minValue}
                {unit}
              </p>
            </Tooltip.Content>
          </Tooltip>
        )}

        {/* Max 핸들 (single mode에서는 single, dual mode에서는 max) */}
        <Tooltip
          className={cn(
            handleClassName,
            (draggingHandle === "max" || draggingHandle === "single") &&
              "scale-110"
          )}
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={(e) =>
            !disabled && handleMouseDown(e, isDual ? "max" : "single")
          }
          onTouchStart={(e) =>
            !disabled && handleTouchStart(e, isDual ? "max" : "single")
          }
        >
          <Tooltip.Content>
            <p>
              {maxValue}
              {unit}
            </p>
          </Tooltip.Content>
        </Tooltip>
      </div>

      {showBounds && (
        <div className="mt-2 flex justify-between text-xs text-text-tertiary">
          <span>
            {min}
            {unit}
          </span>
          <span>
            {max}
            {unit}
          </span>
        </div>
      )}
    </div>
  );
}
