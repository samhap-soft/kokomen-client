/* eslint-disable react/no-unknown-property */
import React, { JSX, memo, Suspense } from "react";
import dynamic from "next/dynamic";
import type { InterviewerProps } from "./avatarMesh";
import { Html } from "@react-three/drei";

// eslint-disable-next-line @rushstack/typedef-var
const AvatarMesh = dynamic(() => import("./avatarMesh"), {
  ssr: false,
  loading: () => (
    <Html>
      <div>Loading Avatar Mesh...</div>
    </Html>
  ),
});

export const Interviewer: React.FC<InterviewerProps> = memo(
  ({
    isSpeaking = false,
    isListening = false,
    emotion = "happy",
  }: InterviewerProps): JSX.Element | null => {
    return (
      <Suspense
        fallback={
          <Html>
            <div className="absolute left-1/2 w-full h-full flex items-center justify-center text-2xl font-bold text-nowrap text-bg-base bg-opacity-80">
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
