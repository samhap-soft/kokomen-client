import React, { JSX, lazy, memo, Suspense } from "react";
import type { InterviewerProps } from "./avatarMesh";
import { Html } from "@react-three/drei";

// eslint-disable-next-line @rushstack/typedef-var
const AvatarMesh = lazy(
  () => import("@components/domains/interviews/avatarMesh")
);

export const Interviewer: React.FC<InterviewerProps> = memo(
  ({
    isSpeaking = false,
    isListening = false,
    emotion = "happy"
  }: InterviewerProps): JSX.Element | null => {
    return (
      <Suspense
        fallback={
          <Html fullscreen>
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-nowrap text-text-light-solid bg-opacity-80">
              면접관님이 허겁지겁 달려오는중..
            </div>
          </Html>
        }
      >
        <group position={[0, -1.8, 1]}>
          <AvatarMesh
            isSpeaking={isSpeaking}
            isListening={isListening}
            emotion={emotion}
          />
        </group>
      </Suspense>
    );
  }
);
Interviewer.displayName = "Interviewer";
