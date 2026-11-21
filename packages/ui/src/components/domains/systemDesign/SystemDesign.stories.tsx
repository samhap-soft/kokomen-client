import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import type {
  RequirementQuestion,
  SystemDesignDiagram,
  SystemDesignStage
} from "@kokomen/types";
import { JSX, useState } from "react";
import { Button } from "../../button";
import { CameraIcon, SettingIcon } from "../../icon";
import { Textarea } from "../../textarea";
import { CurrentQuestion } from "../interviews/room/currentQuestion";
import { InterviewControlBar } from "../interviews/room/interviewControlBar";
import { InterviewRoomHeader } from "../interviews/room/interviewRoomHeader";
import { InterviewRoomLayout } from "../interviews/room/interviewRoomLayout";
import { VideoTile } from "../interviews/room/videoTile";
import {
  StoryInterviewerPanel,
  StoryInterviewerTile,
  useStoryInterviewer
} from "../interviews/room/storyInterviewers";
import { DiagramEditor } from "./diagramEditor";
import { EMPTY_DIAGRAM } from "./diagramModel";
import { RequirementPanel } from "./requirementPanel";
import { StageStepper } from "./stageStepper";
import { SystemDesignWorkspace } from "./systemDesignWorkspace";

const meta: Meta<typeof DiagramEditor> = {
  title: "Domains/SystemDesign",
  component: DiagramEditor,
  parameters: { layout: "fullscreen" }
};
export default meta;
type Story = StoryObj<typeof DiagramEditor>;

/** React Flow 는 부모 크기를 잰 뒤 그리므로 높이가 정해진 틀이 필요하다. */
const editorFrame: NonNullable<Story["decorators"]> = [
  (Story) => (
    <div className="flex h-[640px] flex-col bg-bg-layout p-4">
      <Story />
    </div>
  )
];

const STARTER_DIAGRAM: SystemDesignDiagram = {
  blocks: [
    { id: "client", kind: "CLIENT", label: "Client", props: [], position: { x: 0, y: 120 } },
    { id: "lb", kind: "LOAD_BALANCER", label: "Load Balancer", props: [], position: { x: 240, y: 120 } },
    {
      id: "api",
      kind: "API_SERVER",
      label: "API Server",
      props: [{ key: "개수", value: "3" }],
      position: { x: 480, y: 120 }
    },
    {
      id: "db",
      kind: "DB",
      label: "MySQL",
      props: [
        { key: "역할", value: "primary" },
        { key: "replica", value: "1" }
      ],
      position: { x: 720, y: 40 }
    },
    { id: "cache", kind: "CACHE", label: "Redis", props: [], position: { x: 720, y: 220 } }
  ],
  connections: [
    { id: "c1", source: "client", target: "lb", label: "HTTPS" },
    { id: "c2", source: "lb", target: "api" },
    { id: "c3", source: "api", target: "db", label: "쓰기" },
    { id: "c4", source: "api", target: "cache", label: "읽기" }
  ]
};

export const Empty: Story = {
  decorators: editorFrame,
  args: { defaultValue: EMPTY_DIAGRAM, onChange: fn() }
};

export const WithStarterDiagram: Story = {
  decorators: editorFrame,
  args: { defaultValue: STARTER_DIAGRAM, onChange: fn() }
};

export const ReadOnly: Story = {
  decorators: editorFrame,
  args: { defaultValue: STARTER_DIAGRAM, readOnly: true }
};

export const Stepper: StoryObj<typeof StageStepper> = {
  render: () => (
    <div className="flex flex-col gap-4">
      <StageStepper current="REQUIREMENTS" />
      <StageStepper current="HIGH_LEVEL" />
      <StageStepper current="DEEP_DIVE" />
      <StageStepper current="DEEP_DIVE" isFinished />
    </div>
  )
};

const ASKED: RequirementQuestion[] = [
  {
    question: "하루 요청 수는 어느 정도인가요?",
    answer: "하루 단축 URL 생성은 1억 건, 조회는 그 10배라고 가정해 주세요."
  },
  {
    question: "단축 URL 은 얼마나 보관하나요?",
    answer: "기본 5년 보관입니다."
  }
];

export const Requirements: StoryObj<typeof RequirementPanel> = {
  render: () => (
    <div className="w-[400px]">
      <RequirementPanel items={ASKED} maxCount={5} onAsk={fn()} onComplete={fn()} />
    </div>
  )
};

export const RequirementsExhausted: StoryObj<typeof RequirementPanel> = {
  render: () => (
    <div className="w-[400px]">
      <RequirementPanel
        items={[...ASKED, ...ASKED, ASKED[0]]}
        maxCount={5}
        onAsk={fn()}
        onComplete={fn()}
      />
    </div>
  )
};

function SystemDesignRoom({
  initialStage
}: {
  initialStage: SystemDesignStage;
}): JSX.Element {
  const [stage, setStage] = useState<SystemDesignStage>(initialStage);
  const [items, setItems] = useState<RequirementQuestion[]>(ASKED);
  const [answer, setAnswer] = useState<string>("");
  const interviewer = useStoryInterviewer("manager");

  return (
    <>
    <InterviewRoomLayout
      variant="stage"
      header={
        <InterviewRoomHeader
          title="시스템 설계 모의면접"
          subtitle="텍스트 면접 · 미들"
          current={stage === "REQUIREMENTS" ? 0 : 1}
          total={6}
        />
      }
      interviewerTile={<StoryInterviewerTile state={interviewer} />}
      selfTile={<VideoTile label="나" placeholder="카메라가 꺼져 있어요" />}
      workspace={
        <SystemDesignWorkspace
          topic={{
            title: "URL 단축기를 설계해 보세요",
            description: "긴 URL 을 짧은 URL 로 바꾸고, 짧은 URL 로 접속하면 원래 주소로 보내는 서비스입니다."
          }}
          stepper={<StageStepper current={stage} />}
          sidePanel={
            stage === "REQUIREMENTS" ? (
              <RequirementPanel
                items={items}
                maxCount={5}
                onAsk={(question) =>
                  setItems((prev) => [
                    ...prev,
                    { question, answer: "등록되지 않은 내용이에요. 가정하고 진행하세요." }
                  ])
                }
                onComplete={() => setStage("HIGH_LEVEL")}
              />
            ) : (
              <div className="flex flex-1 flex-col gap-3">
                <CurrentQuestion number={1}>
                  <span className="text-lg">
                    요구사항을 바탕으로 전체 구조를 그리고, 단축 키를 만드는 방법을 설명해 주세요.
                  </span>
                </CurrentQuestion>
                <Textarea
                  name="system-design-answer"
                  aria-label="system-design-answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="설계 의도와 선택한 이유를 적어 주세요."
                  className="min-h-[160px] w-full flex-1 resize-none lg:min-h-28"
                />
              </div>
            )
          }
          editor={<DiagramEditor defaultValue={STARTER_DIAGRAM} onChange={fn()} />}
        />
      }
      controls={
        <InterviewControlBar
          actions={[
            { id: "settings", label: "면접 설정", icon: <SettingIcon />, onClick: fn() },
            { id: "camera", label: "카메라 켜기", icon: <CameraIcon />, pressed: false, onClick: fn() },
            { id: "exit", label: "면접 중도 종료", onClick: fn() }
          ]}
          primaryAction={
            stage === "REQUIREMENTS" ? undefined : (
              <Button
                size="large"
                disabled={!answer.trim()}
                onClick={() => {
                  // 스토리에서는 답변 길이로 반응을 흉내 낸다(실제는 서버 등급)
                  interviewer.react(answer.trim().length > 40 ? "happy" : "angry");
                  setAnswer("");
                }}
              >
                설계 제출
              </Button>
            )
          }
        />
      }
    />
    <StoryInterviewerPanel state={interviewer} />
    </>
  );
}

export const RoomRequirements: Story = {
  render: () => <SystemDesignRoom initialStage="REQUIREMENTS" />
};

export const RoomHighLevel: Story = {
  render: () => <SystemDesignRoom initialStage="HIGH_LEVEL" />
};

export const RoomTablet: Story = {
  render: () => <SystemDesignRoom initialStage="HIGH_LEVEL" />,
  parameters: { viewport: { defaultViewport: "tablet" } }
};

export const RoomMobile: Story = {
  render: () => <SystemDesignRoom initialStage="HIGH_LEVEL" />,
  parameters: { viewport: { defaultViewport: "mobile2" } }
};
