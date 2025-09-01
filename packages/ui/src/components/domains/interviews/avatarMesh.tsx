import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { JSX, useEffect, useRef } from "react";
import {
  AnimationAction,
  Bone,
  Group,
  LoopOnce,
  LoopRepeat,
  SkinnedMesh
} from "three";

type Emotion = "neutral" | "happy" | "encouraging" | "angry";

//애니메이션 : idle, thumbsUp, disappointed, clap
export interface InterviewerProps {
  avatarUrl: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  emotion?: Emotion;
}

export function AvatarMesh({
  avatarUrl,
  isSpeaking,
  isListening,
  emotion
}: InterviewerProps): JSX.Element {
  const gltf = useGLTF(avatarUrl);
  const avatarRef = useRef<Group>(null);
  const headRef = useRef<Bone>(null);
  const morphRef = useRef<SkinnedMesh>(null);
  const { actions } = useAnimations(gltf.animations, avatarRef);
  const currentAction = useRef<AnimationAction | null>(null);

  // 애니메이션 전환하기
  const transitionToAnimation = (
    newAction: AnimationAction | null,
    fadeTime = 0.5,
    loop: typeof LoopOnce | typeof LoopRepeat = LoopOnce
  ): void => {
    if (!newAction) return;

    // 현재 애니메이션 정지
    if (currentAction.current && currentAction.current !== newAction) {
      currentAction.current.fadeOut(fadeTime);
    }

    // 새로운 애니메이션 시작
    newAction.reset();
    newAction.fadeIn(fadeTime);
    newAction.play();

    // 애니메이션 속성 설정
    newAction.clampWhenFinished = true;
    newAction.loop = loop; // THREE.LoopOnce

    currentAction.current = newAction;
  };

  useEffect(() => {
    if (gltf && avatarRef.current) {
      avatarRef.current.traverse((child) => {
        const node = child as Bone & SkinnedMesh;
        if (node.isBone && node.name.toLowerCase() === "head") {
          headRef.current = node;
          node.matrixAutoUpdate = true;
        }
        if (
          node.isMesh &&
          node.morphTargetDictionary &&
          (node.name.toLowerCase().includes("face") ||
            node.name.toLowerCase().includes("head"))
        ) {
          morphRef.current = node;
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

    // Influence 초기화
    for (let i = 0; i < influences.length; i++) {
      influences[i] = 0;
    }

    // 기본 감정 적용 및 애니메이션 전환
    switch (emotion) {
      case "happy":
        if (dict.mouthSmile !== undefined) {
          influences[dict.mouthSmile] = 0.7;
        }

        transitionToAnimation(actions.thumbsup);
        break;

      case "encouraging":
        if (dict.mouthSmile !== undefined) {
          influences[dict.mouthSmile] = 0.4;
        }
        transitionToAnimation(actions.clap);
        break;

      case "angry":
        if (dict.mouthSmile !== undefined) {
          influences[dict.mouthSmile] = -0.6;
        }

        transitionToAnimation(actions.disappointed);
        break;

      case "neutral":
      default:
        if (dict.mouthSmile !== undefined) {
          influences[dict.mouthSmile] = 0.1;
        }

        // idle 애니메이션 사용의 경우에는 계속 반복
        if (actions.idle) {
          if (currentAction.current && currentAction.current !== actions.idle) {
            currentAction.current.fadeOut(0.5);
          }
          transitionToAnimation(actions.idle, 0.5, LoopRepeat);
        }
        break;
    }

    // 클린업
    return () => {
      if (currentAction.current) {
        currentAction.current.fadeOut(0.5);
      }
    };
  }, [emotion, actions]);

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

  return (
    <primitive
      object={gltf.scene}
      ref={avatarRef}
      scale={1.5}
      position={[0, -3, -0.9]}
    />
  );
}

// Default export 추가
export default AvatarMesh;
