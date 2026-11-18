/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/**
 * React Flow 는 실제 레이아웃 크기가 필요해서 jsdom 에서 그릴 수 없다.
 * 에디터만 "블록 두 개를 그린 상태"를 내보내는 자리 표시용으로 바꾼다.
 */
const DRAWN_DIAGRAM: SystemDesignDiagram = {
  blocks: [
    { id: "client", kind: "CLIENT", label: "Client", props: [], position: { x: 0, y: 0 } },
    {
      id: "cache",
      kind: "CACHE",
      label: "Redis",
      props: [{ key: "역할", value: "읽기 캐시" }],
      position: { x: 200, y: 0 }
    }
  ],
  connections: [{ id: "c1", source: "client", target: "cache", label: "읽기" }]
};

jest.mock("@kokomen/ui/systemDesign", () => {
  const actual = jest.requireActual("@kokomen/ui/systemDesign");
  return {
    ...actual,
    DiagramEditor: ({
      onChange,
      readOnly
    }: {
      // eslint-disable-next-line no-unused-vars
      onChange?: (diagram: SystemDesignDiagram) => void;
      readOnly?: boolean;
    }) =>
      readOnly ? (
        <div>읽기 전용 다이어그램</div>
      ) : (
        <button type="button" onClick={() => onChange?.(DRAWN_DIAGRAM)}>
          다이어그램 그리기
        </button>
      )
  };
});

jest.mock("@kokomen/ui/domains", () => ({
  ...jest.requireActual("@kokomen/ui/domains"),
  AiInterviewInterface: () => null
}));

import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import { server } from "@/mocks";
import {
  resetSystemDesignMock,
  systemDesignHandlers
} from "@/mocks/handlers/systemDesign";
import { startSystemDesignInterview } from "@/domains/systemDesign/api";
import { SystemDesignInterviewRoom } from "@/domains/systemDesign/components/systemDesignRoom";
import { SystemDesignReportView } from "@/domains/systemDesign/components/systemDesignReport";
import { toDiagram, toFlowEdges } from "@kokomen/ui/systemDesign";
import type { SystemDesignDiagram } from "@kokomen/types";

const joinRoom = async () => {
  fireEvent.click(await screen.findByRole("button", { name: "면접 입장하기" }));
};

const answerCurrentQuestion = async (answer: string) => {
  fireEvent.change(screen.getByRole("textbox", { name: "system-design-answer" }), {
    target: { value: answer }
  });
  fireEvent.click(screen.getByRole("button", { name: "설계 제출" }));
  await waitFor(() =>
    expect(screen.getByRole("textbox", { name: "system-design-answer" })).toHaveValue("")
  );
};

describe("시스템 설계 면접", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetSystemDesignMock();
    server.use(...systemDesignHandlers);
  });

  it("역질문은 숨은 요구사항으로 답하고, 없는 내용은 가정하라고 답한다", async () => {
    const { interview_id } = await startSystemDesignInterview({ difficulty: "JUNIOR" });
    renderWithProviders(<SystemDesignInterviewRoom interviewId={interview_id} />);
    await joinRoom();

    expect(screen.getByText("URL 단축기를 설계해 보세요")).toBeInTheDocument();
    expect(screen.getByText("남은 질문 5 / 5")).toBeInTheDocument();

    const input = screen.getByRole("textbox", { name: "요구사항 질문" });
    fireEvent.change(input, { target: { value: "하루 요청 수는 어느 정도인가요?" } });
    fireEvent.click(screen.getByRole("button", { name: "질문하기" }));
    expect(await screen.findByText(/100만 건/)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "결제 기능도 있나요?" } });
    fireEvent.click(screen.getByRole("button", { name: "질문하기" }));
    expect(await screen.findByText(/합리적으로 가정하고 진행하세요/)).toBeInTheDocument();
    expect(screen.getByText("남은 질문 3 / 5")).toBeInTheDocument();
  });

  it("역질문 5개를 다 쓰면 입력창이 사라지고 정리 완료 버튼만 남는다", async () => {
    const { interview_id } = await startSystemDesignInterview({ difficulty: "JUNIOR" });
    renderWithProviders(<SystemDesignInterviewRoom interviewId={interview_id} />);
    await joinRoom();

    for (let index = 0; index < 5; index += 1) {
      fireEvent.change(screen.getByRole("textbox", { name: "요구사항 질문" }), {
        target: { value: `질문 ${index + 1}` }
      });
      fireEvent.click(screen.getByRole("button", { name: "질문하기" }));
      await screen.findByText(`질문 ${index + 1}`);
      if (index < 4) {
        await screen.findByText(`남은 질문 ${4 - index} / 5`);
      }
    }

    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: "요구사항 질문" })).not.toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: "요구사항 정리 완료" })).toBeEnabled();
  });

  it("요구사항 → 개략 설계 → 심화를 거쳐 6번째 답변 후 종료되고 리포트에 결과가 나온다", async () => {
    const { interview_id } = await startSystemDesignInterview({ difficulty: "JUNIOR" });
    const { unmount } = renderWithProviders(
      <SystemDesignInterviewRoom interviewId={interview_id} />
    );
    await joinRoom();

    // 요구사항 단계에서는 제출 버튼이 없다
    expect(screen.queryByRole("button", { name: "설계 제출" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "요구사항 질문" }), {
      target: { value: "응답 지연 목표가 있나요?" }
    });
    fireEvent.click(screen.getByRole("button", { name: "질문하기" }));
    await screen.findByText(/100ms/);
    fireEvent.click(screen.getByRole("button", { name: "요구사항 정리 완료" }));

    expect(await screen.findByText(/전체 구조를 그리고/)).toBeInTheDocument();
    const stepper = screen.getByRole("list", { name: "면접 단계" });
    expect(within(stepper).getByText("개략 설계").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(screen.getByRole("button", { name: "설계 제출" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "다이어그램 그리기" }));
    await answerCurrentQuestion("읽기가 많아서 Redis 캐시를 앞에 두고 Base62 로 키를 만듭니다.");
    expect(screen.getByText("질문 2 / 6")).toBeInTheDocument();

    await answerCurrentQuestion("카운터 기반으로 만들어 충돌을 피합니다.");
    await answerCurrentQuestion("MySQL 에 키와 원래 URL 을 저장합니다.");

    // 세 번째 답변 뒤 심화 단계로 넘어간다
    expect(await screen.findByText(/병목이 되고/)).toBeInTheDocument();
    expect(within(stepper).getByText("심화").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );

    await answerCurrentQuestion("캐시를 늘리고 서버를 수평 확장합니다.");
    await answerCurrentQuestion("replica 로 읽기를 넘깁니다.");
    fireEvent.change(screen.getByRole("textbox", { name: "system-design-answer" }), {
      target: { value: "같은 키를 돌려주지 않아도 됩니다." }
    });
    fireEvent.click(screen.getByRole("button", { name: "설계 제출" }));

    expect(await screen.findByText("면접이 종료되었습니다.", { selector: "div" })).toBeInTheDocument();
    unmount();

    renderWithProviders(<SystemDesignReportView interviewId={interview_id} />);
    expect(await screen.findByText(/평가 포인트 4개 중 \d개 충족/)).toBeInTheDocument();
    // 묻지 않은 숨은 요구사항은 "놓친 요구사항"에 나온다
    expect(screen.getByText("보관 기간")).toBeInTheDocument();
    expect(screen.queryByText("응답 지연 목표")).not.toBeInTheDocument();
    expect(screen.getByText("읽기 전용 다이어그램")).toBeInTheDocument();
    expect(screen.getAllByText(/등급/)).toHaveLength(6);
  });
});

describe("다이어그램 저장 형식", () => {
  it("빈 속성과 끊어진 연결은 빼고, 화면 상태는 넣지 않는다", () => {
    const diagram = toDiagram(
      [
        {
          id: "a",
          type: "block",
          position: { x: 10.4, y: 20.6 },
          selected: true,
          data: { kind: "API_SERVER", label: "  ", props: [{ key: "", value: "x" }, { key: "개수", value: "3" }] }
        }
      ],
      [
        { id: "e1", source: "a", target: "missing" },
        { id: "e2", source: "a", target: "a", label: " HTTPS " }
      ]
    );

    expect(diagram).toEqual({
      blocks: [
        {
          id: "a",
          kind: "API_SERVER",
          label: "API Server",
          props: [{ key: "개수", value: "3" }],
          position: { x: 10, y: 21 }
        }
      ],
      connections: [{ id: "e2", source: "a", target: "a", label: "HTTPS" }]
    });
  });

  it("불러온 연결은 두 블록의 위치를 보고 가까운 면끼리 잇는다", () => {
    const [horizontal, vertical] = toFlowEdges(
      [
        { id: "h", source: "a", target: "b" },
        { id: "v", source: "a", target: "c" }
      ],
      [
        { id: "a", kind: "CLIENT", label: "A", props: [], position: { x: 0, y: 0 } },
        { id: "b", kind: "DB", label: "B", props: [], position: { x: 300, y: 20 } },
        { id: "c", kind: "DB", label: "C", props: [], position: { x: 10, y: -300 } }
      ]
    );
    expect(horizontal).toMatchObject({ sourceHandle: "right", targetHandle: "left" });
    expect(vertical).toMatchObject({ sourceHandle: "top", targetHandle: "bottom" });
  });
});
