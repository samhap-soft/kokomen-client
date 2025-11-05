import { cn } from "../../utils";
import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import Tooltip from "../tooltip";

export type RangeProps =
  | {
      min: number;
      max: number;
      defaultValue?: number;
      onChange?: (value: number) => void;
      dual?: false;
      className?: string;
      unit?: string;
    }
  | {
      min: number;
      max: number;
      defaultValue?: [number, number];
      onChange?: (value: [number, number]) => void;
      dual: true;
      className?: string;
      unit?: string;
    };

export function Range(props: RangeProps) {
  const { min, max, className } = props;
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

  return (
    <div
      ref={trackRef}
      aria-label="range"
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={isDual ? minValue : maxValue}
      className={cn(
        "relative w-full h-4 bg-primary-light rounded-full cursor-pointer",
        className
      )}
    >
      {/* 진행 바 */}
      <div
        className="absolute top-0 h-full bg-primary rounded-full pointer-events-none"
        style={{
          left: `${minPercentage}%`,
          width: `${maxPercentage - minPercentage}%`
        }}
      />

      {/* Min 핸들 (dual mode only) */}
      {isDual && (
        <Tooltip
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-primary rounded-full p-0 shadow-md transition-transform hover:scale-110 cursor-grab active:cursor-grabbing z-10",
            draggingHandle === "min" && "scale-110 bg-primary-light"
          )}
          style={{ left: `${minPercentage}%` }}
          onMouseDown={(e) => handleMouseDown(e, "min")}
          onTouchStart={(e) => handleTouchStart(e, "min")}
        >
          <Tooltip.Content>
            <p>
              {minValue}
              {props.unit ?? ""}
            </p>
          </Tooltip.Content>
        </Tooltip>
      )}

      {/* Max 핸들 (single mode에서는 single, dual mode에서는 max) */}
      <Tooltip
        className={cn(
          "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-primary rounded-full p-0 shadow-md transition-transform hover:scale-110 cursor-grab active:cursor-grabbing z-10",
          (draggingHandle === "max" || draggingHandle === "single") &&
            "scale-110 bg-primary-light"
        )}
        style={{ left: `${maxPercentage}%` }}
        onMouseDown={(e) => handleMouseDown(e, isDual ? "max" : "single")}
        onTouchStart={(e) => handleTouchStart(e, isDual ? "max" : "single")}
      >
        <Tooltip.Content>
          <p>
            {maxValue}
            {props.unit ?? ""}
          </p>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}
