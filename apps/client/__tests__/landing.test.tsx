import "@testing-library/jest-dom";
import { screen, render, fireEvent } from "@testing-library/react";
import Home from "@/pages";

describe("랜딩 페이지 렌더링 테스트", () => {
  it("정상적으로 렌더링 되는지 테스트", () => {
    render(<Home />);
    expect(screen.getByText("새로운 기준")).toBeInTheDocument();
  });
  it("네비게이션 링크가 올바르게 렌더링 되는지 테스트", () => {
    render(<Home />);
    const homeLink = screen.getByText("홈");
    const interviewsLink = screen.getByText("면접");

    expect(homeLink).toBeInTheDocument();
    expect(interviewsLink).toBeInTheDocument();
  });
});
describe("랜딩 페이지 기능 테스트", () => {
  const mockPush = jest.fn();

  it("버튼을 눌렀을 때 제대로 동작하는지 테스트", () => {
    render(<Home />);
    const button = screen.getByRole("link", { name: "면접 연습 시작하기" });
    console.log(button);
    fireEvent.click(button);
    expect(mockPush).toHaveBeenCalledWith("/interviews");
  });
});
