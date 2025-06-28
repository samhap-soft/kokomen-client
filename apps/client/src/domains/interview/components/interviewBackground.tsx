/* eslint-disable react/no-unknown-property */
import { useTexture } from "@react-three/drei";
import React, { memo } from "react";

const InterviewBackground: React.FC = memo(() => {
  const texture = useTexture("/interviewBg.jpg");

  return (
    <mesh scale={[9, 6, 1]} position={[0, 0, -3]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
});
InterviewBackground.displayName = "InterviewBackground";
export default InterviewBackground;
