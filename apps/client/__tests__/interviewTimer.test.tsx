/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { InterviewTimer } from "@/domains/interview/components/interviewTimer";

const DURATION = 3;

/**
 * 답변 제출 흐름을 그대로 재현한다.
 * 시간 초과 → 제출 중(isActive=false) → 다음 질문 도착 + 제출 완료(isActive=true)가
 * 같은 커밋에서 반영된다.
 */
function Harness({
  questionId,
  isActive,
  onTimeout
}: {
  questionId: number;
  isActive: boolean;
  onTimeout: () => void;
}) {
  return (
    <InterviewTimer
      key={questionId}
      durationSeconds={DURATION}
      isActive={isActive}
      onTimeout={onTimeout}
    />
  );
}

describe("면접 답변 타이머", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("시간 초과로 자동 제출된 뒤, 다음 질문에서 곧바로 다시 타임아웃되지 않는다", () => {
    const onTimeout = jest.fn();
    const { rerender } = render(
      <Harness questionId={1} isActive={true} onTimeout={onTimeout} />
    );

    act(() => {
      jest.advanceTimersByTime(DURATION * 1000);
    });
    expect(onTimeout).toHaveBeenCalledTimes(1);

    // 제출 중
    rerender(<Harness questionId={1} isActive={false} onTimeout={onTimeout} />);
    // 다음 질문 도착 + 제출 완료
    rerender(<Harness questionId={2} isActive={true} onTimeout={onTimeout} />);

    expect(onTimeout).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("timer")).toHaveTextContent("0:03");
  });

  it("다음 질문에서도 제한 시간이 지나면 정상적으로 타임아웃된다", () => {
    const onTimeout = jest.fn();
    const { rerender } = render(
      <Harness questionId={1} isActive={true} onTimeout={onTimeout} />
    );

    act(() => {
      jest.advanceTimersByTime(DURATION * 1000);
    });
    rerender(<Harness questionId={2} isActive={true} onTimeout={onTimeout} />);
    expect(onTimeout).toHaveBeenCalledTimes(1);

    // 새 질문의 제한 시간이 다 되면 다시 호출된다
    act(() => {
      jest.advanceTimersByTime(DURATION * 1000);
    });
    expect(onTimeout).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("timer")).toHaveTextContent("0:00");
  });

  it("제출 중(isActive=false)에는 카운트다운이 멈춘다", () => {
    const onTimeout = jest.fn();
    const { rerender } = render(
      <Harness questionId={1} isActive={true} onTimeout={onTimeout} />
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("0:02");

    rerender(<Harness questionId={1} isActive={false} onTimeout={onTimeout} />);
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.getByRole("timer")).toHaveTextContent("0:02");
    expect(onTimeout).not.toHaveBeenCalled();
  });
});
