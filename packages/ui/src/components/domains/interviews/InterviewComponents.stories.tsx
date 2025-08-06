import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import InterviewModals from "./interviewModals";
import InterviewSideBar from "./interviewSideBar";
import AiInterviewInterface from "./AiInterviewInterface";
import { InterviewState } from "@kokomen/types";

// Mock InterviewState and InterviewActions for stories
const mockInterviewState: InterviewState = {
  status: "thinking",
  currentQuestionId: 1,
  message: "안녕하세요.",
  questionsAndAnswers: [
    { answer: "안녕하세요.", question: "자기소개를 해주세요." }
  ]
};

const mockDispatch = (action: any) => {
  console.log("Dispatch action:", action);
};

const meta: Meta<typeof AiInterviewInterface> = {
  title: "Domains/Interviews",
  component: () => {
    return (
      <div>
        <AiInterviewInterface />
        <InterviewModals
          state={mockInterviewState}
          dispatch={mockDispatch}
          rootQuestion="자기소개를 해주세요."
        />
      </div>
    );
  },
  parameters: {
    layout: "fullscreen"
  },
  args: {
    emotion: "neutral",
    isListening: false,
    isSpeaking: false
  },
  tags: ["autodocs"]
};

export const AiInterviewInterfaceDemo: Story = {
  render: () => {
    const [emotion, setEmotion] = useState<
      "neutral" | "happy" | "encouraging" | "angry"
    >("neutral");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    return (
      <div className="min-h-screen bg-gray-900">
        <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-2">
            AI 인터뷰 인터페이스 컨트롤
          </h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">감정</label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value as any)}
                className="w-full p-2 border rounded"
              >
                <option value="neutral">중립</option>
                <option value="happy">행복</option>
                <option value="encouraging">격려</option>
                <option value="angry">화남</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isListening}
                  onChange={(e) => setIsListening(e.target.checked)}
                  className="mr-2"
                />
                듣는 중
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSpeaking}
                  onChange={(e) => setIsSpeaking(e.target.checked)}
                  className="mr-2"
                />
                말하는 중
              </label>
            </div>
          </div>
        </div>

        <div className="w-full h-screen">
          <AiInterviewInterface
            emotion={emotion}
            isListening={isListening}
            isSpeaking={isSpeaking}
          />
        </div>
      </div>
    );
  }
};

export default meta;
type Story = StoryObj<typeof InterviewModals>;

export const StartInterviewButton: Story = {
  render: () => (
    <div className="min-h-screen bg-gray-900 relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <InterviewModals
          state={mockInterviewState}
          dispatch={mockDispatch}
          rootQuestion="자기소개를 해주세요."
        />
      </div>
    </div>
  )
};

export const InterviewSideBarDefault: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const mockQuestionAndAnswer = [
      {
        question: "자기소개를 해주세요.",
        answer:
          "안녕하세요. 저는 홍길동입니다. 웹 개발자로 3년간 일해왔고, React와 TypeScript에 전문성을 가지고 있습니다."
      },
      {
        question: "가장 어려웠던 프로젝트는 무엇인가요?",
        answer:
          "대규모 전자상거래 플랫폼을 개발할 때였습니다. 성능 최적화와 사용자 경험 개선에 많은 시간을 투자했습니다."
      },
      {
        question: "팀워크에 대해 어떻게 생각하시나요?",
        answer:
          "팀워크는 프로젝트 성공의 핵심이라고 생각합니다. 서로의 의견을 존중하고 협력하는 것이 중요합니다."
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">면접 사이드바 데모</h1>
          <p className="text-gray-600 mb-4">
            우측 상단의 사이드바 버튼을 클릭하여 면접 질문과 답변을 확인할 수
            있습니다.
          </p>
        </div>

        <InterviewSideBar
          prevQuestionAndAnswer={mockQuestionAndAnswer}
          open={open}
          openSidebar={() => setOpen(true)}
          closeSidebar={() => setOpen(false)}
        />
      </div>
    );
  }
};

export const InterviewSideBarEmpty: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">빈 면접 사이드바</h1>
          <p className="text-gray-600 mb-4">
            아직 질문과 답변이 없는 상태입니다.
          </p>
        </div>

        <InterviewSideBar
          prevQuestionAndAnswer={[]}
          open={open}
          openSidebar={() => setOpen(true)}
          closeSidebar={() => setOpen(false)}
        />
      </div>
    );
  }
};

export const InterviewSideBarManyQuestions: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const mockQuestionAndAnswer = [
      {
        question: "자기소개를 해주세요.",
        answer:
          "안녕하세요. 저는 홍길동입니다. 웹 개발자로 3년간 일해왔고, React와 TypeScript에 전문성을 가지고 있습니다."
      },
      {
        question: "가장 어려웠던 프로젝트는 무엇인가요?",
        answer:
          "대규모 전자상거래 플랫폼을 개발할 때였습니다. 성능 최적화와 사용자 경험 개선에 많은 시간을 투자했습니다."
      },
      {
        question: "팀워크에 대해 어떻게 생각하시나요?",
        answer:
          "팀워크는 프로젝트 성공의 핵심이라고 생각합니다. 서로의 의견을 존중하고 협력하는 것이 중요합니다."
      },
      {
        question: "새로운 기술을 배우는 방법은?",
        answer:
          "공식 문서를 먼저 읽고, 작은 프로젝트로 실습해보며, 커뮤니티에 참여하여 다른 개발자들과 소통합니다."
      },
      {
        question: "코드 리뷰의 중요성에 대해 어떻게 생각하시나요?",
        answer:
          "코드 리뷰는 코드 품질 향상과 지식 공유에 매우 중요합니다. 서로의 코드를 검토하며 더 나은 솔루션을 찾을 수 있습니다."
      },
      {
        question: "성장하는 개발자가 되기 위한 방법은?",
        answer:
          "지속적인 학습과 실습, 그리고 다른 개발자들과의 소통이 중요합니다. 새로운 기술을 두려워하지 않고 도전하는 자세가 필요합니다."
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">
            많은 질문이 있는 면접 사이드바
          </h1>
          <p className="text-gray-600 mb-4">
            여러 질문과 답변이 있는 상태입니다. 스크롤하여 모든 내용을 확인할 수
            있습니다.
          </p>
        </div>

        <InterviewSideBar
          prevQuestionAndAnswer={mockQuestionAndAnswer}
          open={open}
          openSidebar={() => setOpen(true)}
          closeSidebar={() => setOpen(false)}
        />
      </div>
    );
  }
};
