import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import InterviewModals from "./interviewModals";
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
        <AiInterviewInterface avatarUrl="/interviewer.glb" />
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
  // Chromatic capture-v9(2026-09-16 적용) 캡처 브라우저에서는 WebGL 컨텍스트를
  // 만들 수 없어 react-three-fiber Canvas 가 렌더 도중 throw 한다. 3D 씬은
  // 애니메이션이라 스냅샷 비교 자체가 무의미하므로 캡처 대상에서 제외한다.
  parameters: {
    chromatic: { disableSnapshot: true }
  },
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
            avatarUrl="/interviewer.glb"
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
