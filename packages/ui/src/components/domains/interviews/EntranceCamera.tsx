import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { JSX, useEffect, useRef } from "react";
import * as THREE from "three";
import type { InterviewPhase } from "./useInterviewPhase";

interface CameraKeyframe {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

const KEYFRAMES: Record<InterviewPhase, CameraKeyframe> = {
  WAITING: {
    position: new THREE.Vector3(1.5, 1.6, -0.4),
    lookAt: new THREE.Vector3(1.5, 1.2, -0.79)
  },
  KNOCKING: {
    position: new THREE.Vector3(1.5, 1.6, -0.4),
    lookAt: new THREE.Vector3(1.5, 1.2, -0.79)
  },
  DOOR_OPENING: {
    position: new THREE.Vector3(1.5, 1.6, -1.0),
    lookAt: new THREE.Vector3(3.0, 1.2, -3.1)
  },
  WALKING_IN: {
    position: new THREE.Vector3(2.0, 1.6, -2.0),
    lookAt: new THREE.Vector3(4.0, 1.2, -3.1)
  },
  SITTING_DOWN: {
    position: new THREE.Vector3(3.0, 1.18, -3.1),
    lookAt: new THREE.Vector3(5.5, 1.2, -3.1)
  },
  INTERVIEW: {
    position: new THREE.Vector3(3.0, 1.18, -3.1),
    lookAt: new THREE.Vector3(5.5, 1.2, -3.1)
  }
};

interface EntranceCameraProps {
  phase: InterviewPhase;
}

export default function EntranceCamera({
  phase
}: EntranceCameraProps): JSX.Element {
  const targetPosition = useRef(new THREE.Vector3(1.5, 1.6, -0.4));
  const targetLookAt = useRef(new THREE.Vector3(1.5, 1.2, -0.79));
  const currentLookAt = useRef(new THREE.Vector3(1.5, 1.2, -0.79));

  useEffect(() => {
    const keyframe = KEYFRAMES[phase];
    targetPosition.current.copy(keyframe.position);
    targetLookAt.current.copy(keyframe.lookAt);
  }, [phase]);

  useFrame((state, delta) => {
    const camera = state.camera;
    const lerpFactor = Math.min(delta * 1.8, 1);
    camera.position.lerp(targetPosition.current, lerpFactor);
    currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
    camera.lookAt(currentLookAt.current);
  });

  return (
    <PerspectiveCamera
      makeDefault
      position={[1.5, 1.6, -0.4]}
      fov={55}
      near={0.1}
      far={100}
    />
  );
}
