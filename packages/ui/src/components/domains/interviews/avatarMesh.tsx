import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { JSX, useEffect, useRef } from "react";
import { Bone, Group, SkinnedMesh } from "three";

type Emotion = "neutral" | "happy" | "encouraging" | "angry";
export interface InterviewerProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  emotion?: Emotion;
}

export function AvatarMesh({
  isSpeaking,
  isListening,
  emotion
}: InterviewerProps): JSX.Element {
  const gltf = useGLTF(
    "https://models.readyplayer.me/685c0ddc61adecd150499bc8.glb"
  );

  const avatarRef = useRef<Group>(null);
  const headRef = useRef<Bone>(null);
  const morphRef = useRef<SkinnedMesh>(null);

  useEffect(() => {
    if (gltf && avatarRef.current) {
      avatarRef.current.traverse((child: any) => {
        if (child.isBone && child.name.toLowerCase() === "head") {
          headRef.current = child;
          child.matrixAutoUpdate = true;
        }
        if (
          child.isMesh &&
          child.morphTargetDictionary &&
          (child.name.toLowerCase().includes("face") ||
            child.name.toLowerCase().includes("head"))
        ) {
          morphRef.current = child;
        }
      });
    }
  }, [gltf]);

  useEffect(() => {
    const mesh = morphRef.current;
    if (!mesh || !mesh.morphTargetInfluences || !mesh.morphTargetDictionary) {
      return;
    }

    const dict = mesh.morphTargetDictionary;
    const influences = mesh.morphTargetInfluences;

    // Reset all expressions
    for (let i = 0; i < influences.length; i++) {
      influences[i] = 0;
    }

    // Apply base emotion
    switch (emotion) {
      case "happy":
        if (dict.mouthSmile !== undefined) {
          influences[dict.mouthSmile] = 0.7;
        }
        break;

      case "encouraging":
        if (dict.mouthSmile !== undefined) {
          influences[dict.mouthSmile] = 0.4;
        }
        break;

      case "angry":
        if (dict.mouthSmile !== undefined) {
          influences[dict.mouthSmile] = -0.6;
        }
        break;

      case "neutral":
      default:
        if (dict.mouthSmile !== undefined) {
          influences[dict.mouthSmile] = 0.1;
        }
        break;
    }
  }, [emotion, morphRef]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 아바타 전체의 움직임
    if (avatarRef.current) {
      avatarRef.current.position.y = isListening
        ? Math.sin(time * 2) * 0.005
        : Math.sin(time * 1.2) * 0.005;
    }

    // 아바타 고개끄덕거리기
    if (headRef.current) {
      const baseHeadUp = -0.3; // 기본적으로 고개를 들게 하는 값

      headRef.current.rotation.x = isListening
        ? baseHeadUp + Math.sin(time * 5) * 0.07
        : baseHeadUp + Math.sin(time * 3) * 0.05;

      headRef.current.rotation.y = isListening
        ? Math.sin(time * 3) * 0.05
        : Math.sin(time * 0.6) * 0.05;
    }

    const mesh = morphRef.current;
    if (!mesh || !mesh.morphTargetInfluences || !mesh.morphTargetDictionary)
      return;

    const dict = mesh.morphTargetDictionary;
    const influences = mesh.morphTargetInfluences;
    if (isSpeaking) {
      const mouthMovement =
        Math.sin(time * 8 + Math.sin(time * 6) * 0.5) * 0.3 + 0.1;

      if (dict.mouthOpen !== undefined)
        influences[dict.mouthOpen] = mouthMovement * 1.5;
    }
  });
  return <primitive object={gltf.scene} ref={avatarRef} scale={1} />;
}

// Default export 추가
export default AvatarMesh;
