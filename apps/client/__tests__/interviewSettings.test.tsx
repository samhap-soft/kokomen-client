/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import InterviewSettingsButton from "@/domains/interview/components/interviewSettingsButton";
import { useInterviewSettings } from "@/domains/interview/hooks/useInterviewSettings";

/** 실제 페이지처럼 설정 훅과 설정 dialog를 함께 렌더한다 */
function SettingsHarness() {
  const { settings, toggleSetting } = useInterviewSettings();
  return (
    <>
      <InterviewSettingsButton settings={settings} onToggle={toggleSetting} />
      <span data-testid="time-limit">
        {String(settings.isTimeLimitEnabled)}
      </span>
      <span data-testid="append-only">
        {String(settings.isAppendOnlyEnabled)}
      </span>
    </>
  );
}

function openSettings() {
  renderWithProviders(<SettingsHarness />);
  fireEvent.click(screen.getByRole("button", { name: "면접 설정 열기" }));
}

describe("면접 설정 dialog", () => {
  beforeEach(() => window.localStorage.clear());

  it("두 옵션 모두 기본값은 꺼짐이고 설명이 함께 보인다", () => {
    openSettings();

    expect(
      screen.getByRole("switch", { name: "답변 시간 제한" })
    ).toHaveAttribute("aria-checked", "false");
    expect(
      screen.getByRole("switch", { name: "답변 수정 금지" })
    ).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText(/90초 안에 답변해야 하고/)).toBeInTheDocument();
    expect(
      screen.getByText(/한 번 입력한 답변은 지우거나 고칠 수 없어요/)
    ).toBeInTheDocument();
  });

  it("옵션을 켜고 끌 수 있다", () => {
    openSettings();
    const timeLimitSwitch = screen.getByRole("switch", {
      name: "답변 시간 제한"
    });

    fireEvent.click(timeLimitSwitch);
    expect(screen.getByTestId("time-limit")).toHaveTextContent("true");
    expect(timeLimitSwitch).toHaveAttribute("aria-checked", "true");

    fireEvent.click(timeLimitSwitch);
    expect(screen.getByTestId("time-limit")).toHaveTextContent("false");
  });

  it("변경한 설정은 다음 면접에서도 유지된다", () => {
    openSettings();
    fireEvent.click(screen.getByRole("switch", { name: "답변 수정 금지" }));

    // 새로 진입한 면접 페이지
    renderWithProviders(<SettingsHarness />);

    expect(screen.getAllByTestId("append-only")[1]).toHaveTextContent("true");
  });
});
