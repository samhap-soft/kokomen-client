import { InterviewerProps } from "@/domains/interview/components/avatarMesh";
import { Interviewer } from "@/domains/interview/components/interviewer";
import { Environment, Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { JSX, Suspense } from "react";

// eslint-disable-next-line @rushstack/typedef-var
const InterviewBackground = dynamic(
  () => import("@/domains/interview/components/interviewBackground"),
  {
    ssr: false,
  }
);

export default function AiInterviewInterface({
  emotion,
  isListening,
  isSpeaking,
}: InterviewerProps): JSX.Element {
  return (
    <Canvas camera={{ position: [0, 0, 2], fov: 40 }} shadows dpr={[1, 2]}>
      <Suspense
        fallback={
          <Html fullscreen>
            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-nowrap bg-gradient-to-r from-blue-50 to-primary-bg-hover bg-opacity-80">
              면접관님에게 전화하는 중...
            </div>
          </Html>
        }
      >
        <InterviewBackground />
        <Environment preset="lobby" resolution={2048} />
        <Interviewer
          emotion={emotion}
          isSpeaking={isSpeaking}
          isListening={isListening}
        />
      </Suspense>
    </Canvas>
  );
}
