import { InterviewerProps } from "./avatarMesh";
import Interviewer from "./interviewer";
import { Environment, Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { JSX, Suspense } from "react";

export default function AiInterviewInterface({
  avatarUrl,
  emotion,
  isListening,
  isSpeaking
}: InterviewerProps): JSX.Element {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.6], fov: 30 }}
      shadows
      dpr={[1, 2]}
      style={{
        backgroundImage: "url(/interviewBg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <Suspense
        fallback={
          <Html fullscreen zIndexRange={[40, 49]}>
            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-nowrap bg-gradient-to-r from-blue-50 to-primary-bg-hover bg-opacity-80">
              면접관님에게 전화하는 중...
            </div>
          </Html>
        }
      >
        <Environment preset="lobby" resolution={2048} />
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
