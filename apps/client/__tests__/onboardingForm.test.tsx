import { server } from "@/mocks";
import OnboardingForm from "@/domains/onboarding/components/onboardingForm";
import { renderWithProviders } from "@/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { mockReplace } from "jest.setup";
import { delay, http, HttpResponse } from "msw";

const ONBOARDING_SURVEY_URL: string = `${process.env.NEXT_PUBLIC_API_BASE_URL}/members/me/onboarding-survey`;

function setScreenWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width
  });
  window.dispatchEvent(new Event("resize"));
}

function selectOption(questionKey: string, optionValue: string): void {
  fireEvent.click(
    screen.getByTestId(`onboarding-option-${questionKey}-${optionValue}`)
  );
}

describe("온보딩 폼 - 데스크탑(한 스텝에 두 문항)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setScreenWidth(1280);
  });

  it("스텝별 문항이 노출되고, 모든 문항을 채우면 다음 스텝으로 이동한다", async () => {
    renderWithProviders(<OnboardingForm redirectTo="/interviews" />);

    const nextButton = await screen.findByTestId("onboarding-next-button");
    expect(nextButton).toHaveTextContent("다음 단계 (1/3)");
    expect(nextButton).toBeDisabled();

    // 1번 문항만 선택한 상태에서는 다음으로 넘어갈 수 없다.
    selectOption("career_goal", "BACKEND");
    expect(nextButton).toBeDisabled();

    selectOption("prep_stages", "JOB_SEEKING");
    expect(nextButton).toBeEnabled();

    fireEvent.click(nextButton);
    expect(
      screen.getByText("면접 질문에 포함할 기술/분야를 선택해주세요.", {
        exact: false
      })
    ).toBeInTheDocument();
    expect(screen.getByTestId("onboarding-next-button")).toHaveTextContent(
      "다음 단계 (2/3)"
    );

    // 이전 버튼으로 되돌아갈 수 있다.
    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(screen.getByTestId("onboarding-next-button")).toHaveTextContent(
      "다음 단계 (1/3)"
    );
    // 이전 스텝의 선택값은 유지된다.
    expect(
      screen.getByTestId("onboarding-option-career_goal-BACKEND")
    ).toHaveAttribute("aria-checked", "true");
  });

  it("마지막 스텝에서 제출하면 스펙에 맞는 본문을 보내고 완료 화면이 노출된다", async () => {
    let requestBody: unknown = null;
    server.use(
      http.post(ONBOARDING_SURVEY_URL, async ({ request }) => {
        requestBody = await request.json();
        await delay(50);
        return new HttpResponse(null, { status: 200 });
      })
    );
    renderWithProviders(<OnboardingForm redirectTo="/interviews" />);

    await screen.findByTestId("onboarding-next-button");

    selectOption("career_goal", "BACKEND");
    selectOption("prep_stages", "JOB_SEEKING");
    fireEvent.click(screen.getByTestId("onboarding-next-button"));

    selectOption("tech_topics", "JAVA_SPRING");
    selectOption("tech_topics", "DATABASE");
    selectOption("target_company_type", "ANY");
    fireEvent.click(screen.getByTestId("onboarding-next-button"));

    selectOption("interview_experience", "NONE");
    selectOption("weak_points", "CS");
    const submitButton = screen.getByTestId("onboarding-next-button");
    expect(submitButton).toHaveTextContent("맞춤 면접 시작하기 🚀");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("모든 설정이 완료되었어요!")).toBeInTheDocument();
    });
    expect(requestBody).toEqual({
      career_goal: "BACKEND",
      prep_stages: ["JOB_SEEKING"],
      tech_topics: ["JAVA_SPRING", "DATABASE"],
      target_company_type: "ANY",
      interview_experience: "NONE",
      weak_points: ["CS"]
    });

    fireEvent.click(screen.getByRole("button", { name: "꼬꼬면 시작하기" }));
    expect(mockReplace).toHaveBeenCalledWith("/interviews");
  });

  it("제출이 실패하면 서버 메시지를 토스트로 알려준다", async () => {
    server.use(
      http.post(ONBOARDING_SURVEY_URL, async () => {
        await delay(50);
        return HttpResponse.json(
          { message: "career_goal은 null일 수 없습니다." },
          { status: 400 }
        );
      })
    );
    renderWithProviders(<OnboardingForm redirectTo="/interviews" />);

    await screen.findByTestId("onboarding-next-button");

    selectOption("career_goal", "BACKEND");
    selectOption("prep_stages", "JOB_SEEKING");
    fireEvent.click(screen.getByTestId("onboarding-next-button"));

    selectOption("tech_topics", "JAVA_SPRING");
    selectOption("target_company_type", "ANY");
    fireEvent.click(screen.getByTestId("onboarding-next-button"));

    selectOption("interview_experience", "NONE");
    selectOption("weak_points", "CS");
    fireEvent.click(screen.getByTestId("onboarding-next-button"));

    await waitFor(() => {
      expect(
        screen.getByText("온보딩 정보 저장에 실패했습니다.")
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText("career_goal은 null일 수 없습니다.")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("모든 설정이 완료되었어요!")
    ).not.toBeInTheDocument();
  });
});

describe("온보딩 폼 - 모바일(한 스텝에 한 문항)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setScreenWidth(375);
  });

  it("문항 수만큼 스텝이 생기고 한 문항씩 노출된다", async () => {
    renderWithProviders(<OnboardingForm redirectTo="/" />);

    const nextButton = await screen.findByTestId("onboarding-next-button");
    expect(nextButton).toHaveTextContent("다음 단계 (1/6)");
    expect(
      screen.queryByText("현재 취업 준비 단계는 어디인가요?")
    ).not.toBeInTheDocument();

    selectOption("career_goal", "FRONTEND");
    fireEvent.click(nextButton);

    expect(
      screen.getByText("현재 취업 준비 단계는 어디인가요?")
    ).toBeInTheDocument();
    expect(screen.getByTestId("onboarding-next-button")).toHaveTextContent(
      "다음 단계 (2/6)"
    );
  });
});
