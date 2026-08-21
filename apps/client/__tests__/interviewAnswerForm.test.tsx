/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import { InterviewAnswerForm } from "@/domains/interview/components/interviewAnswerForm";

const BLOCKED_EDIT_MESSAGE = "이미 입력한 답변은 수정하거나 지울 수 없습니다.";

function AnswerForm({
  isAppendOnlyEnabled = true,
  isTimeLimitEnabled = false
}: {
  isAppendOnlyEnabled?: boolean;
  isTimeLimitEnabled?: boolean;
}) {
  return (
    <InterviewAnswerForm
      isInterviewStarted={true}
      cur_question="현재 질문"
      cur_question_id={2}
      prev_questions_and_answers={[]}
      updateInterviewData={jest.fn()}
      interviewId={1}
      setIsListening={jest.fn()}
      totalQuestions={3}
      setInterviewerEmotion={jest.fn()}
      playAudio={jest.fn().mockResolvedValue(undefined)}
      mode="TEXT"
      isFinished={false}
      isAppendOnlyEnabled={isAppendOnlyEnabled}
      isTimeLimitEnabled={isTimeLimitEnabled}
    />
  );
}

function getAnswerInput() {
  return screen.getByRole("textbox", {
    name: "interview-answer"
  }) as HTMLTextAreaElement;
}

/** "답변 수정 금지"가 켜진 상태로 렌더한다(기존 append-only 동작) */
function renderForm() {
  renderWithProviders(<AnswerForm />);

  return getAnswerInput();
}

/** IME 조합 한 음절을 입력한다. steps는 조합 중간값들("ㅇ" -> "아" -> "안") */
function composeSyllable(
  input: HTMLTextAreaElement,
  prefix: string,
  steps: string[]
) {
  fireEvent.compositionStart(input, { data: "" });
  steps.forEach((step) => {
    fireEvent.change(input, { target: { value: `${prefix}${step}` } });
  });
  fireEvent.compositionEnd(input, {
    data: steps[steps.length - 1]
  });
}

describe("면접 답변 입력 - 답변 수정 금지 ON", () => {
  it("한글 자음/모음 조합이 정상적으로 합성된다", () => {
    const input = renderForm();

    composeSyllable(input, "", ["ㅇ", "아", "안"]);
    expect(input.value).toBe("안");

    composeSyllable(input, "안", ["ㄴ", "녀", "녕"]);
    expect(input.value).toBe("안녕");
  });

  it("조합 중에는 백스페이스로 자모를 수정할 수 있다", () => {
    const input = renderForm();

    fireEvent.compositionStart(input, { data: "" });
    fireEvent.change(input, { target: { value: "ㅇ" } });
    fireEvent.change(input, { target: { value: "아" } });
    fireEvent.change(input, { target: { value: "안" } });

    // 조합 중 백스페이스는 막지 않는다(IME가 "안" -> "아"로 분해)
    const backspace = fireEvent.keyDown(input, {
      key: "Backspace",
      isComposing: true
    });
    expect(backspace).toBe(true); // preventDefault 되지 않음
    fireEvent.change(input, { target: { value: "아" } });
    fireEvent.compositionEnd(input, { data: "아" });

    expect(input.value).toBe("아");
    expect(screen.queryByText(BLOCKED_EDIT_MESSAGE)).not.toBeInTheDocument();
  });

  it("확정된 답변을 지우려 하면 차단하고 토스트로 안내한다", () => {
    const input = renderForm();

    composeSyllable(input, "", ["ㅇ", "아", "안"]);
    expect(input.value).toBe("안");

    const backspace = fireEvent.keyDown(input, { key: "Backspace" });
    expect(backspace).toBe(false); // preventDefault 됨
    expect(input.value).toBe("안");
    expect(screen.getByText(BLOCKED_EDIT_MESSAGE)).toBeInTheDocument();
  });

  it("연속으로 삭제를 시도해도 토스트는 항상 하나만 보인다", () => {
    const input = renderForm();

    composeSyllable(input, "", ["ㅇ", "아", "안"]);

    for (let i = 0; i < 5; i++) {
      fireEvent.keyDown(input, { key: "Backspace" });
    }

    expect(screen.getAllByText(BLOCKED_EDIT_MESSAGE)).toHaveLength(1);
    expect(input.value).toBe("안");
  });

  it("조합이 끊겨 남은 꼬리 자모는 지울 수 있다", () => {
    const input = renderForm();

    // "안녕" 입력 후 "나"를 조합하다가 모음을 지워 "ㄴ"만 남고 조합이 끝난 상황
    composeSyllable(input, "", ["ㅇ", "아", "안"]);
    composeSyllable(input, "안", ["ㄴ", "녀", "녕"]);
    fireEvent.compositionStart(input, { data: "" });
    fireEvent.change(input, { target: { value: "안녕ㄴ" } });
    fireEvent.change(input, { target: { value: "안녕나" } });
    fireEvent.change(input, { target: { value: "안녕ㄴ" } });
    fireEvent.compositionEnd(input, { data: "ㄴ" });
    expect(input.value).toBe("안녕ㄴ");

    // 남은 "ㄴ"은 완성된 글자가 아니므로 삭제 허용
    const backspace = fireEvent.keyDown(input, { key: "Backspace" });
    expect(backspace).toBe(true); // preventDefault 되지 않음
    fireEvent.change(input, { target: { value: "안녕" } });
    expect(input.value).toBe("안녕");
    expect(screen.queryByText(BLOCKED_EDIT_MESSAGE)).not.toBeInTheDocument();

    // 완성된 "녕"부터는 다시 삭제 불가
    expect(fireEvent.keyDown(input, { key: "Backspace" })).toBe(false);
    expect(screen.getByText(BLOCKED_EDIT_MESSAGE)).toBeInTheDocument();
  });

  it("확정된 내용을 잘라내거나 붙여넣기로 바꾸려 하면 원래 값으로 되돌린다", () => {
    const input = renderForm();

    composeSyllable(input, "", ["ㅇ", "아", "안"]);
    composeSyllable(input, "안", ["ㄴ", "녀", "녕"]);
    expect(input.value).toBe("안녕");

    // 앞부분을 다른 내용으로 바꾸는 변경(붙여넣기/드래그 등)
    fireEvent.change(input, { target: { value: "잘있어" } });

    expect(input.value).toBe("안녕");
    expect(screen.getByText(BLOCKED_EDIT_MESSAGE)).toBeInTheDocument();
  });

  it("영문 등 조합이 없는 입력은 그대로 이어붙는다", () => {
    const input = renderForm();

    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.change(input, { target: { value: "ab" } });
    expect(input.value).toBe("ab");

    fireEvent.change(input, { target: { value: "a" } });
    expect(input.value).toBe("ab");
  });
});

describe("면접 답변 입력 - 답변 수정 금지 OFF", () => {
  it("입력한 답변을 자유롭게 지울 수 있다", () => {
    renderWithProviders(<AnswerForm isAppendOnlyEnabled={false} />);
    const input = getAnswerInput();

    composeSyllable(input, "", ["ㅇ", "아", "안"]);
    composeSyllable(input, "안", ["ㄴ", "녀", "녕"]);
    expect(input.value).toBe("안녕");

    // 삭제 키를 막지 않고, 실제 값도 줄어든다
    expect(fireEvent.keyDown(input, { key: "Backspace" })).toBe(true);
    fireEvent.change(input, { target: { value: "안" } });

    expect(input.value).toBe("안");
    expect(screen.queryByText(BLOCKED_EDIT_MESSAGE)).not.toBeInTheDocument();
  });

  it("중간 내용을 다른 값으로 바꿔도 되돌리지 않는다", () => {
    renderWithProviders(<AnswerForm isAppendOnlyEnabled={false} />);
    const input = getAnswerInput();

    fireEvent.change(input, { target: { value: "안녕하세요" } });
    fireEvent.change(input, { target: { value: "다시 씁니다" } });

    expect(input.value).toBe("다시 씁니다");
    expect(screen.queryByText(BLOCKED_EDIT_MESSAGE)).not.toBeInTheDocument();
  });

  it("도중에 설정을 켜면 그때까지 입력한 내용부터 잠긴다", () => {
    const { rerender } = renderWithProviders(
      <AnswerForm isAppendOnlyEnabled={false} />
    );
    const input = getAnswerInput();

    fireEvent.change(input, { target: { value: "설정 끄고 쓴 답변" } });

    rerender(<AnswerForm isAppendOnlyEnabled={true} />);

    expect(fireEvent.keyDown(input, { key: "Backspace" })).toBe(false);
    expect(input.value).toBe("설정 끄고 쓴 답변");
    expect(screen.getByText(BLOCKED_EDIT_MESSAGE)).toBeInTheDocument();
  });
});

describe("면접 답변 시간 제한 설정", () => {
  it("설정이 꺼져 있으면 타이머가 보이지 않는다", () => {
    renderWithProviders(<AnswerForm isTimeLimitEnabled={false} />);

    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("설정을 켜면 그 순간부터 제한 시간이 시작된다", () => {
    const { rerender } = renderWithProviders(
      <AnswerForm isTimeLimitEnabled={false} />
    );

    rerender(<AnswerForm isTimeLimitEnabled={true} />);

    expect(screen.getByRole("timer")).toHaveTextContent("1:30");
  });
});
