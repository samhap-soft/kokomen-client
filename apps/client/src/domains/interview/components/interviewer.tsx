/* eslint-disable react/no-unknown-property */
import React, { useRef, useEffect, JSX } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";
// import office from '../../../../public/office.hdr'

type Emotion = "neutral" | "happy" | "encouraging";
type InterviewerProps = {
  isSpeaking?: boolean;
  isListening?: boolean;
  emotion?: Emotion;
};
export function Interviewer({
  isSpeaking = false,
  isListening = false,
  emotion = "happy",
}: InterviewerProps): JSX.Element | null {
  const gltf = useLoader(
    GLTFLoader,
    "https://models.readyplayer.me/685c0ddc61adecd150499bc8.glb"
  );

  const avatarRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Bone>(null);
  const morphRef = useRef<THREE.SkinnedMesh>(null);

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
      console.log("Wolf3D_Head not ready yet");
      return;
    }

    const dict = mesh.morphTargetDictionary;
    const influences = mesh.morphTargetInfluences;
    console.log("✅ Wolf3D_Head morph system ready");
    console.log("Morph target influences:", mesh);
    console.log("Available morphs:", Object.keys(dict));

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
        ? Math.sin(time * 2) * 0.01
        : Math.sin(time * 1.2) * 0.005;
      avatarRef.current.rotation.z = isListening
        ? Math.sin(time * 1.5) * 0.005
        : 0;
    }

    // 아바타 고개끄덕거리기
    if (headRef.current) {
      const baseHeadUp = -0.3; // 기본적으로 고개를 들게 하는 값

      headRef.current.rotation.x = isListening
        ? baseHeadUp + Math.sin(time * 5) * 0.2
        : baseHeadUp + Math.sin(time * 3) * 0.05;

      headRef.current.rotation.y = isListening
        ? Math.sin(time * 2.5) * 0.05
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

  return gltf ? (
    <group position={[0, -1.8, 1]}>
      <primitive object={gltf.scene} ref={avatarRef} scale={1} />
    </group>
  ) : null;
}

export function AIBackgroundImage(): JSX.Element {
  const texture = useLoader(THREE.TextureLoader, "/interviewBg.jpg");

  return (
    <mesh scale={[9, 6, 1]} position={[0, 0, -3]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
