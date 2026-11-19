import { InterviewerProps } from "./avatarMesh";
import Interviewer from "./interviewer";
import { Environment, Html, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { JSX, Suspense } from "react";
import MeetingRoom from "./MeetingRoom";

export interface AiInterviewInterfaceProps extends InterviewerProps {
  meetingRoomUrl?: string;
}

/**
 * 면접관 3D 씬. 면접실 레이아웃의 "AI 면접관" 영상 타일 안에 들어간다.
 *
 * 예전에는 노크 · 문 열림 · 걸어 들어오기 연출을 이 씬에서 했지만,
 * 입장 전 화면(InterviewLobby)으로 바꾸면서 카메라를 면접관 앞에 고정했다.
 * 타일이 작아서 화각을 좁혀 상반신이 보이게 잡는다.
 */
export default function AiInterviewInterface({
  avatarUrl,
  emotion,
  isListening,
  isSpeaking,
  meetingRoomUrl
}: AiInterviewInterfaceProps): JSX.Element {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <Suspense
        fallback={
          <Html fullscreen zIndexRange={[10, 19]}>
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-nowrap text-text-light-solid">
              면접관을 모시는 중...
            </div>
          </Html>
        }
      >
        <PerspectiveCamera
          makeDefault
          position={[3.0, 1.18, -3.1]}
          rotation={[0, -Math.PI / 2, 0]}
          fov={40}
          near={0.1}
          far={100}
        />
        {/* drei 프리셋은 외부 CDN에서 HDRI를 받아온다. 전체 씬 Suspense에 묶이면
            네트워크가 느리거나 차단된 환경에서 면접장 자체가 뜨지 않으므로
            별도 경계로 격리한다. 아래 조명만으로도 씬은 보인다. */}
        <Suspense fallback={null}>
          <Environment preset="apartment" />
        </Suspense>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 2]} intensity={0.6} castShadow />

        {meetingRoomUrl && <MeetingRoom url={meetingRoomUrl} />}

        <Interviewer
          avatarUrl={avatarUrl}
          emotion={emotion}
          isSpeaking={isSpeaking}
          isListening={isListening}
        />
      </Suspense>
    </Canvas>
  );
}
