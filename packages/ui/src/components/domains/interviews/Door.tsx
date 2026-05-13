import { useFrame } from "@react-three/fiber";
import { JSX, useRef } from "react";
import * as THREE from "three";
import type { InterviewPhase } from "./useInterviewPhase";

interface DoorProps {
  phase: InterviewPhase;
}

const DOOR_WIDTH = 0.9;
const DOOR_HEIGHT = 2.1;
const DOOR_DEPTH = 0.04;
const DOOR_POSITION: [number, number, number] = [0.99, 0, -0.79];

export default function Door({ phase }: DoorProps): JSX.Element {
  const pivotRef = useRef<THREE.Group>(null);
  const isOpen =
    phase === "DOOR_OPENING" ||
    phase === "WALKING_IN" ||
    phase === "SITTING_DOWN" ||
    phase === "INTERVIEW";

  useFrame((_, delta) => {
    if (!pivotRef.current) return;
    const target = isOpen ? -Math.PI / 2 : 0;
    pivotRef.current.rotation.y = THREE.MathUtils.lerp(
      pivotRef.current.rotation.y,
      target,
      delta * 2.5
    );
  });

  return (
    <group position={DOOR_POSITION}>
      {/* Door frame */}
      <mesh position={[DOOR_WIDTH / 2, DOOR_HEIGHT + 0.03, 0]}>
        <boxGeometry args={[DOOR_WIDTH + 0.12, 0.06, 0.1]} />
        <meshStandardMaterial color="#5C3A1E" />
      </mesh>
      <mesh position={[-0.03, DOOR_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.06, DOOR_HEIGHT, 0.1]} />
        <meshStandardMaterial color="#5C3A1E" />
      </mesh>
      <mesh position={[DOOR_WIDTH + 0.03, DOOR_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.06, DOOR_HEIGHT, 0.1]} />
        <meshStandardMaterial color="#5C3A1E" />
      </mesh>

      {/* Door panel (pivots from left edge) */}
      <group ref={pivotRef}>
        <mesh position={[DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0]}>
          <boxGeometry args={[DOOR_WIDTH, DOOR_HEIGHT, DOOR_DEPTH]} />
          <meshStandardMaterial color="#8B6914" />
        </mesh>
        {/* Door handle */}
        <mesh position={[DOOR_WIDTH - 0.1, DOOR_HEIGHT / 2, DOOR_DEPTH / 2 + 0.02]}>
          <boxGeometry args={[0.12, 0.03, 0.04]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}
