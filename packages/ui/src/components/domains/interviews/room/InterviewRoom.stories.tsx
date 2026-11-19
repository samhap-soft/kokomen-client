import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { JSX, useState } from "react";
import { Button } from "../../../button";
import { CameraIcon, MicIcon, MicOffIcon, SettingIcon } from "../../../icon";
import { Textarea } from "../../../textarea";
import { AnswerHistoryPanel } from "./answerHistoryPanel";
import { CurrentQuestion } from "./currentQuestion";
import { InterviewControlBar, InterviewControlAction } from "./interviewControlBar";
import { InterviewLobby } from "./interviewLobby";
import { InterviewerPicker } from "./interviewerPicker";
import { InterviewRoomHeader } from "./interviewRoomHeader";
import { InterviewRoomLayout } from "./interviewRoomLayout";
import { RecordingIndicator } from "./recordingIndicator";
import { TextAnswerWorkspace } from "./textAnswerWorkspace";
import { VideoTile } from "./videoTile";
import LiveCodingEditor from "../liveCodingEditor";
import LiveCodingProblem from "../liveCodingProblem";
import {
  STORY_INTERVIEWERS,
  StoryInterviewerPanel,
  StoryInterviewerTile,
  useStoryInterviewer
} from "./storyInterviewers";

/**
 * 면접실 레이아웃(Figma 인터뷰 / to-be 1172:2426 · 1172:2473 · 1172:2527).
 *
 * 면접관 타일은 실제 면접관 영상(apps/client/public/interviewer)을 쓴다. 왼쪽 아래 조작 패널로
 * 면접관을 바꾸고 말하기 · 칭찬 · 아쉬움 반응을 틀어 볼 수 있다. 내 카메라는 기기 권한이 필요해서
 * 자리 표시용 타일을 쓴다. 툴바의 viewport 로 모바일 · 태블릿 배치를 확인한다.
 */
const meta: Meta<typeof InterviewRoomLayout> = {
  title: "Domains/Interviews/Room",
  component: InterviewRoomLayout,
  parameters: { layout: "fullscreen" }
};
export default meta;
type Story = StoryObj<typeof InterviewRoomLayout>;

const HISTORY = [
  {
    question: "브라우저 렌더링 과정을 설명해 주세요.",
    answer:
      "브라우저는 HTML과 CSS를 파싱해 각각 DOM과 CSSOM을 만듭니다. 두 트리를 결합해 렌더 트리를 만들고, 레이아웃 단계에서 요소의 크기와 위치를 계산합니다."
  },
  {
    question: "리플로우와 리페인트의 차이를 설명해 주세요.",
    answer:
      "리플로우는 요소의 크기나 위치가 바뀌어 레이아웃을 다시 계산하는 과정이고, 리페인트는 레이아웃은 그대로인 채 색처럼 보이는 부분만 다시 그리는 과정입니다."
  }
];

function SelfTile({ isCameraOn = true }: { isCameraOn?: boolean }): JSX.Element {
  return isCameraOn ? (
    <VideoTile label="나">
      <div className="h-full w-full bg-gradient-to-br from-blue-3 to-blue-7" />
    </VideoTile>
  ) : (
    <VideoTile label="나" placeholder="카메라가 꺼져 있어요" />
  );
}

function useControlActions(mode: "TEXT" | "VOICE"): InterviewControlAction[] {
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isExpressionOn, setIsExpressionOn] = useState<boolean>(false);
  return [
    { id: "settings", label: "면접 설정", icon: <SettingIcon />, onClick: fn() },
    ...(mode === "VOICE"
      ? [
          {
            id: "mic",
            label: isMicOn ? "마이크 끄기" : "마이크 켜기",
            icon: isMicOn ? <MicIcon /> : <MicOffIcon />,
            pressed: isMicOn,
            onClick: () => setIsMicOn((prev) => !prev)
          }
        ]
      : []),
    {
      id: "camera",
      label: isCameraOn ? "카메라 끄기" : "카메라 켜기",
      icon: <CameraIcon />,
      pressed: isCameraOn,
      onClick: () => setIsCameraOn((prev) => !prev)
    },
    {
      id: "expression",
      label: isExpressionOn ? "표정 분석 끄기" : "표정 분석 켜기",
      pressed: isExpressionOn,
      onClick: () => setIsExpressionOn((prev) => !prev)
    },
    ...(mode === "TEXT"
      ? [{ id: "voice-input", label: "음성으로 말하기", onClick: fn() }]
      : []),
    { id: "exit", label: "면접 중도 종료", onClick: fn() }
  ];
}

function TextRoom({ showHistory = false }: { showHistory?: boolean }): JSX.Element {
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(showHistory);
  const [answer, setAnswer] = useState<string>(
    "브라우저는 HTML을 파싱해 DOM 트리를 만들고, CSS를 파싱해 CSSOM 트리를 만듭니다."
  );
  const actions = useControlActions("TEXT");
  const interviewer = useStoryInterviewer();
  return (
    <>
    <InterviewRoomLayout
      variant="split"
      header={
        <InterviewRoomHeader
          title="프론트엔드 모의면접"
          subtitle="텍스트 면접"
          current={isHistoryOpen ? 3 : 1}
          total={3}
        />
      }
      interviewerTile={<StoryInterviewerTile state={interviewer} />}
      selfTile={<SelfTile />}
      workspace={
        isHistoryOpen ? (
          <AnswerHistoryPanel
            items={HISTORY}
            onBack={() => setIsHistoryOpen(false)}
          />
        ) : (
          <TextAnswerWorkspace
            questionNumber={1}
            question="브라우저 렌더링 과정을 설명해 주세요."
            draftStatus="초안 자동 저장됨"
            onOpenHistory={() => setIsHistoryOpen(true)}
          >
            <Textarea
              name="answer"
              aria-label="interview-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              className="h-full min-h-[200px] w-full flex-1 resize-none lg:min-h-0"
            />
          </TextAnswerWorkspace>
        )
      }
      controls={
        <InterviewControlBar
          actions={actions}
          primaryAction={
            isHistoryOpen ? undefined : (
              <Button size="large" className="md:min-w-48" disabled={!answer.trim()}>
                답변 제출
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

export const Text: Story = { render: () => <TextRoom /> };

export const TextAnswerHistory: Story = {
  render: () => <TextRoom showHistory />
};

export const TextTablet: Story = {
  render: () => <TextRoom />,
  parameters: { viewport: { defaultViewport: "tablet" } }
};

export const TextMobile: Story = {
  render: () => <TextRoom />,
  parameters: { viewport: { defaultViewport: "mobile2" } }
};

function VoiceRoom(): JSX.Element {
  const actions = useControlActions("VOICE");
  const interviewer = useStoryInterviewer();
  return (
    <>
    <InterviewRoomLayout
      variant="focus"
      header={
        <InterviewRoomHeader
          title="프론트엔드 모의면접"
          subtitle="음성 면접"
          current={1}
          total={3}
        />
      }
      interviewerTile={<StoryInterviewerTile state={interviewer} />}
      selfTile={
        <VideoTile status="나 · 카메라 켜짐">
          <div className="h-full w-full bg-gradient-to-br from-blue-3 to-blue-7" />
        </VideoTile>
      }
      workspace={
        <>
          <CurrentQuestion number={1} variant="bar">
            브라우저 렌더링 과정을 설명해 주세요.
          </CurrentQuestion>
          <RecordingIndicator isRecording className="self-end" />
        </>
      }
      controls={
        <InterviewControlBar
          actions={actions}
          primaryAction={
            <Button size="large" className="md:min-w-48">
              답변 완료 및 제출
            </Button>
          }
        />
      }
    />
    <StoryInterviewerPanel state={interviewer} />
    </>
  );
}

export const Voice: Story = { render: () => <VoiceRoom /> };

export const VoiceMobile: Story = {
  render: () => <VoiceRoom />,
  parameters: { viewport: { defaultViewport: "mobile2" } }
};

const LIVE_CODING_PROBLEM = `# 두 수의 합

정수 배열 \`nums\` 와 정수 \`target\` 이 주어집니다. 합이 \`target\` 이 되는 두 수의 **인덱스**를 반환하세요.

- 정답은 하나만 있다고 가정합니다.
- 같은 원소를 두 번 쓸 수 없습니다.

### 예시

\`\`\`
입력: nums = [2, 7, 11, 15], target = 9
출력: [0, 1]
\`\`\`

### 제약

- 2 ≤ nums.length ≤ 10⁴
- 시간 복잡도 O(n) 을 목표로 해 보세요.
`;

const LIVE_CODING_STARTER = `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i += 1) {
    // 여기에 풀이를 작성하세요
  }
}
`;

function StageRoom(): JSX.Element {
  const actions = useControlActions("TEXT");
  const interviewer = useStoryInterviewer("senior");
  return (
    <>
    <InterviewRoomLayout
      variant="stage"
      header={
        <InterviewRoomHeader
          title="알고리즘 모의면접"
          subtitle="라이브 코딩"
          current={1}
          total={3}
        />
      }
      interviewerTile={<StoryInterviewerTile state={interviewer} />}
      selfTile={<SelfTile isCameraOn={false} />}
      workspace={
        <div className="flex flex-1 flex-col gap-3 lg:min-h-0 lg:flex-row">
          <section
            aria-label="문제"
            className="max-h-[40vh] overflow-y-auto rounded-xl bg-bg-base lg:max-h-none lg:w-2/5"
          >
            <LiveCodingProblem markdownContent={LIVE_CODING_PROBLEM} className="h-full" />
          </section>
          <section
            aria-label="코드 작성"
            className="flex min-h-[420px] flex-1 flex-col gap-3 lg:min-h-0"
          >
            <select
              defaultValue="javascript"
              aria-label="programming-language"
              className="self-start rounded-lg border border-border bg-bg-base px-3 py-1.5 text-sm"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
            <LiveCodingEditor
              language="javascript"
              defaultCode={LIVE_CODING_STARTER}
              className="min-h-[260px] flex-1 lg:min-h-40"
            />
            <Textarea
              name="live-coding-explanation"
              aria-label="live-coding-explanation"
              rows={2}
              placeholder="풀이 의도나 설명을 적어주세요. 꼬리질문에는 설명만 적어도 돼요."
              className="block max-h-[160px] w-full resize-none"
            />
          </section>
        </div>
      }
      controls={
        <InterviewControlBar
          actions={actions}
          primaryAction={<Button size="large">작성 완료</Button>}
        />
      }
    />
    <StoryInterviewerPanel state={interviewer} />
    </>
  );
}

export const LiveCodingStage: Story = { render: () => <StageRoom /> };

export const LiveCodingStageTablet: Story = {
  render: () => <StageRoom />,
  parameters: { viewport: { defaultViewport: "tablet" } }
};

function LobbyPicker(): JSX.Element {
  const [selectedId, setSelectedId] = useState<string>("default");
  return (
    <InterviewerPicker
      options={STORY_INTERVIEWERS}
      selectedId={selectedId}
      onSelect={setSelectedId}
    />
  );
}

export const Lobby: StoryObj<typeof InterviewLobby> = {
  render: () => (
    <InterviewLobby
      title="프론트엔드 모의면접"
      details={["텍스트 면접 · 질문 3개", "토큰 3개를 사용해요"]}
      preview={<SelfTile />}
      deviceControls={
        <>
          <Button variant="secondary" aria-label="카메라 끄기" className="size-12 p-0">
            <CameraIcon />
          </Button>
        </>
      }
      options={<LobbyPicker />}
      notice={
        <p className="text-sm text-text-tertiary">
          카메라는 표정 분석에만 쓰이고 영상은 저장하지 않아요.
        </p>
      }
      onJoin={fn()}
    />
  )
};

export const LobbyMobile: StoryObj<typeof InterviewLobby> = {
  ...Lobby,
  parameters: { viewport: { defaultViewport: "mobile2" } }
};
