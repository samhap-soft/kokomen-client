import { InterviewerProps } from "./avatarMesh";
import Interviewer from "./interviewer";
import { Environment, Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { JSX, Suspense } from "react";
import MeetingRoom from "./MeetingRoom";
import EntranceCamera from "./EntranceCamera";
import Door from "./Door";
import KnockButton from "./KnockButton";
import LiveCodingPaper from "./LiveCodingPaper";
import { InterviewPhase } from "./useInterviewPhase";

export interface AiInterviewInterfaceProps extends InterviewerProps {
  phase?: InterviewPhase;
  onKnock?: () => void;
  meetingRoomUrl?: string;
  /** 라이브 코딩 면접 여부: true이면 책상 위 3D 종이를 클릭해 코딩 화면을 열 수 있다 */
  isLiveCoding?: boolean;
  /** 라이브 코딩 종이 클릭 시 호출 */
  onOpenLiveCoding?: () => void;
}

export default function AiInterviewInterface({
  avatarUrl,
  emotion,
  isListening,
  isSpeaking,
  phase = "INTERVIEW",
  onKnock,
  meetingRoomUrl,
  isLiveCoding = false,
  onOpenLiveCoding
}: AiInterviewInterfaceProps): JSX.Element {
  const showInterviewer =
    phase === "WALKING_IN" ||
    phase === "SITTING_DOWN" ||
    phase === "INTERVIEW";

  return (
    <Canvas shadows dpr={[1, 2]}>
      <Suspense
        fallback={
          <Html fullscreen zIndexRange={[40, 49]}>
            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-nowrap bg-gradient-to-r from-blue-50 to-primary-bg-hover bg-opacity-80">
              면접장을 준비하는 중...
            </div>
          </Html>
        }
      >
        <EntranceCamera phase={phase} />
        <Environment preset="apartment" />
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 2]} intensity={0.6} castShadow />

        {meetingRoomUrl && <MeetingRoom url={meetingRoomUrl} />}
        <Door phase={phase} />

        {/* Whiteboard on far wall */}
        <group position={[5.25, 1.4, -3.1]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[1.8, 1.2, 0.03]} />
            <meshStandardMaterial color="#f8f8f8" />
          </mesh>
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry args={[1.85, 1.25, 0.02]} />
            <meshStandardMaterial color="#555555" metalness={0.3} roughness={0.6} />
          </mesh>
        </group>


        {phase === "WAITING" && onKnock && <KnockButton onClick={onKnock} />}

        {showInterviewer && (
          <Interviewer
            avatarUrl={avatarUrl}
            emotion={emotion}
            isSpeaking={isSpeaking}
            isListening={isListening}
          />
        )}

        {/* 종이의 <Text> 폰트 로딩이 전체 씬 Suspense로 전파돼 깜빡이는 것을
            막기 위해 별도 경계로 격리한다. fallback은 비워 둔다. */}
        {isLiveCoding && phase === "INTERVIEW" && onOpenLiveCoding && (
          <Suspense fallback={null}>
            <LiveCodingPaper onClick={onOpenLiveCoding} />
          </Suspense>
        )}
      </Suspense>
    </Canvas>
  );
}
