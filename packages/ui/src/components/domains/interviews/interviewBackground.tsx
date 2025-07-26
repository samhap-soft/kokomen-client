import { useTexture } from "@react-three/drei";
import React, { memo } from "react";
import interviewBackground from "../../../../public/interviewBg.jpg";

const InterviewBackground: React.FC = memo(() => {
  const texture = useTexture(interviewBackground);

  return (
    <mesh scale={[9, 6, 1]} position={[0, 0, -3]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
});
InterviewBackground.displayName = "InterviewBackground";
export default InterviewBackground;
