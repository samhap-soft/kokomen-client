import { motion, useAnimationControls } from "motion/react";
import React, { useEffect, useRef, useCallback } from "react";

interface MarqueeProps {
  children: React.ReactNode;
  duration?: number;
  direction?: "left" | "right";
  className?: string;
  gap?: number;
  pauseOnHover?: boolean;
}

function Marquee({
  children,
  duration = 20,
  direction = "left",
  className = "",
  gap = 20,
  pauseOnHover = false
}: MarqueeProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const isPausedRef = useRef(false);

  const animateScroller = useCallback((): void => {
    if (!containerRef.current || !scrollerRef.current) return;

    const originalChildren = Array.from(scrollerRef.current.children).filter(
      (child) => !child.hasAttribute("data-cloned")
    );

    // 복사된 children 모두 지우기
    Array.from(scrollerRef.current.children)
      .filter((child) => child.hasAttribute("data-cloned"))
      .forEach((child) => child.remove());

    const containerWidth = containerRef.current.offsetWidth;
    const scrollerContent = originalChildren;
    // scrollerContent가 없으면 아무것도 하지 않음
    if (scrollerContent.length === 0) return;

    // 원본 content의 총 너비 계산
    let contentWidth = 0;
    scrollerContent.forEach((item) => {
      contentWidth += (item as HTMLElement).offsetWidth + gap;
    });

    // 복사해야하는 횟수 계산(최소 2회)
    const duplicateCount = Math.max(
      2,
      Math.ceil((containerWidth * 2) / contentWidth) + 1
    );

    // container width를 채우기 위해 복사
    // 무한 스크롤을 위해 최소 2개
    for (let i = 0; i < duplicateCount; i++) {
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true) as HTMLElement;
        duplicatedItem.setAttribute("data-cloned", "true");
        scrollerRef.current?.appendChild(duplicatedItem);
      });
    }

    // 스크롤 거리 계산(원본 요소들의 총 너비)
    const scrollDistance = contentWidth;

    const startAnimation = async (): Promise<void> => {
      // 초기 위치 설정
      controls.set({ x: direction === "left" ? 0 : -scrollDistance });

      // 무한 애니메이션 시작
      await controls.start({
        x: direction === "left" ? -scrollDistance : 0,
        transition: {
          duration: duration,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop" as const,
          repeatDelay: 0
        }
      });
    };

    if (!isPausedRef.current) {
      startAnimation().catch(console.error);
    }
  }, [controls, direction, duration, gap]);

  useEffect(() => {
    // 초기 설정
    animateScroller();

    // window resize 이벤트 핸들러
    const handleResize = (): void => {
      controls.stop();
      animateScroller();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      controls.stop();
      window.removeEventListener("resize", handleResize);
    };
  }, [animateScroller, controls]);

  const handleMouseEnter = useCallback((): void => {
    if (pauseOnHover) {
      isPausedRef.current = true;
      controls.stop();
    }
  }, [pauseOnHover, controls]);

  const handleMouseLeave = useCallback((): void => {
    if (pauseOnHover) {
      isPausedRef.current = false;
      animateScroller();
    }
  }, [pauseOnHover, animateScroller]);

  return (
    <div
      ref={containerRef}
      className={`marquee-container relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={scrollerRef}
        className="marquee-content inline-flex items-center h-full"
        animate={controls}
        style={{
          gap: `${gap}px`,
          willChange: "transform"
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface MarqueeItemProps {
  children: React.ReactNode;
  className?: string;
}

function MarqueeItem({
  children,
  className = ""
}: MarqueeItemProps): React.ReactElement {
  return (
    <div className={`marquee-item inline-flex flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
}

export { Marquee, MarqueeItem };
