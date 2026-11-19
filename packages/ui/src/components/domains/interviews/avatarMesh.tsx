import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { JSX, useEffect, useRef } from "react";
import {
  AnimationAction,
  Bone,
  Group,
  LoopOnce,
  MeshStandardMaterial,
  Quaternion,
  LoopRepeat,
  SkinnedMesh,
  Vector3
} from "three";

type Emotion = "neutral" | "happy" | "encouraging" | "angry";

/**
 * 감정별로 찾을 애니메이션 클립 이름. 앞에서부터 처음 있는 클립을 쓴다.
 * - 예전 RPM 면접관: idle / thumbsup / clap / disappointed
 * - Meshy 면접관(interviewer-v2.glb): 앉은 자세 라이브러리 동작
 *   Chair_Sit_Idle_M(33) · Sit_Thumbs_Up_Right(357) · Sitting_Clap(354)
 *   실망 동작은 라이브러리에 없어서 대기 동작 위에 고개 젓기를 코드로 얹는다.
 */
const CLIP_CANDIDATES = {
  idle: ["idle", "Chair_Sit_Idle_M"],
  happy: ["thumbsup", "Sit_Thumbs_Up_Right"],
  encouraging: ["clap", "Sitting_Clap"],
  angry: ["disappointed"]
} as const;

/**
 * 머리 뼈대가 놓일 월드 좌표. AiInterviewInterface 의 카메라(3.0, 1.18, -3.1, +X 방향)에서
 * 1m 앞, 살짝 위라서 작은 타일에 얼굴과 상반신이 함께 보인다.
 * 모델마다 크기 · 원점이 달라도 불러온 뒤 이 지점에 머리를 맞춘다.
 */
const HEAD_TARGET: Vector3 = new Vector3(4.3, 1.27, -3.1);

/** 대기 동작이 섞여 들어오는 시간(0.5초)보다 넉넉히 기다린 뒤 위치를 맞춘다 */
const FIT_DELAY_SECONDS: number = 1;

/**
 * 대기 동작을 재생하지 않고 한 장면에 멈춰 둘 클립과 시점(초).
 * Chair_Sit_Idle_M 은 몇 초마다 몸을 크게 앞으로 숙여 작은 타일에서는 머리가 화면 밖으로 나간다.
 * 허리를 편 순간에 멈추고, 움직임은 아래 useFrame 의 끄덕임 · 숨쉬기로 대신한다.
 */
const IDLE_HOLD_SECONDS: Record<string, number> = { Chair_Sit_Idle_M: 0.5 };

/** 실망 동작이 없을 때 고개를 젓는 시간(초) */
const HEAD_SHAKE_SECONDS: number = 1.6;

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
  const headShakeUntilRef = useRef<number>(0);
  /**
   * 머리 뼈대에 애니메이션 트랙이 있으면(Meshy 리그) 매 프레임 애니메이션이 회전을 덮어쓴다.
   * 그때는 끄덕임을 "더하기"로 얹고, 트랙이 없으면(예전 RPM 리그) 회전값을 직접 쓴다.
   */
  const isHeadAnimatedRef = useRef<boolean>(false);
  /** 끄덕임을 더하기 전 머리 회전(애니메이션이 정한 값)과, 지난 프레임에 우리가 남긴 회전 */
  const headRestRef = useRef<Quaternion>(new Quaternion());
  const headLastSetRef = useRef<Quaternion | null>(null);
  /** 머리를 HEAD_TARGET 에 맞춘 뒤의 기준 위치. 흔들림은 이 위에 더한다 */
  const basePositionRef = useRef<Vector3 | null>(null);
  const fitStartRef = useRef<number | null>(null);

  const findAction = (
    names: readonly string[]
  ): AnimationAction | null => {
    for (const name of names) {
      const action = actions[name];
      if (action) return action;
    }
    return null;
  };

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
          isHeadAnimatedRef.current = gltf.animations.some((clip) =>
            clip.tracks.some((track) =>
              track.name.startsWith(`${node.name}.`)
            )
          );
        }
        // Meshy 의 PBR 텍스처는 피부 · 머리카락에도 금속성이 섞여 있어, 면접실 환경광(HDRI)을
        // 거울처럼 반사해 하얀 얼룩이 생긴다. 사람 모델이므로 금속성을 끄고 반사를 줄인다.
        if (node.isMesh && node.material instanceof MeshStandardMaterial) {
          const material = node.material;
          if (material.metalnessMap || material.metalness > 0) {
            material.metalnessMap = null;
            material.metalness = 0;
            material.roughness = Math.max(material.roughness, 0.75);
            material.envMapIntensity = 0.35;
            material.needsUpdate = true;
          }
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

  // 미소 형상 키. Meshy 모델처럼 형상 키가 없으면 건너뛴다(동작은 아래에서 따로 처리)
  useEffect(() => {
    const mesh = morphRef.current;
    const dict = mesh?.morphTargetDictionary;
    const influences = mesh?.morphTargetInfluences;
    if (!dict || !influences) return;

    influences.fill(0);
    if (dict.mouthSmile === undefined) return;
    const SMILE_BY_EMOTION: Record<Emotion, number> = {
      happy: 0.7,
      encouraging: 0.4,
      angry: -0.6,
      neutral: 0.1
    };
    influences[dict.mouthSmile] = SMILE_BY_EMOTION[emotion ?? "neutral"];
  }, [emotion, gltf]);

  // 감정별 동작. 해당 동작이 없으면 대기 동작을 반복한다
  useEffect(() => {
    const oneShot =
      emotion === "happy"
        ? findAction(CLIP_CANDIDATES.happy)
        : emotion === "encouraging"
          ? findAction(CLIP_CANDIDATES.encouraging)
          : emotion === "angry"
            ? findAction(CLIP_CANDIDATES.angry)
            : null;

    if (emotion === "angry" && !oneShot) {
      // 실망 동작이 없는 모델은 잠깐 고개를 젓는다
      headShakeUntilRef.current =
        performance.now() / 1000 + HEAD_SHAKE_SECONDS;
    }

    if (oneShot) {
      transitionToAnimation(oneShot);
    } else {
      const idle = findAction(CLIP_CANDIDATES.idle);
      transitionToAnimation(idle, 0.5, LoopRepeat);
      const holdSeconds = idle ? IDLE_HOLD_SECONDS[idle.getClip().name] : undefined;
      if (idle && holdSeconds !== undefined) {
        idle.time = holdSeconds;
        idle.timeScale = 0;
      }
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

    const avatar = avatarRef.current;
    // 대기 동작이 자세를 다 잡은 뒤, 머리 위치로 아바타를 한 번 옮긴다
    if (avatar && headRef.current && !basePositionRef.current) {
      fitStartRef.current ??= time;
      if (time - fitStartRef.current >= FIT_DELAY_SECONDS && avatar.parent) {
        const headWorld = headRef.current.getWorldPosition(new Vector3());
        const parent = avatar.parent;
        const delta = parent
          .worldToLocal(HEAD_TARGET.clone())
          .sub(parent.worldToLocal(headWorld)); // worldToLocal 은 인자를 바꾼다
        basePositionRef.current = avatar.position.clone().add(delta);
      }
    }
    // 위치를 맞추기 전에는 엉뚱한 자리에 보이지 않도록 숨긴다
    if (avatar) avatar.visible = basePositionRef.current !== null || !headRef.current;

    // 아바타 전체의 움직임
    if (avatar && basePositionRef.current) {
      const bob = isListening
        ? Math.sin(time * 2) * 0.005
        : Math.sin(time * 1.2) * 0.005;
      avatar.position.set(
        basePositionRef.current.x,
        basePositionRef.current.y + bob,
        basePositionRef.current.z
      );
    }

    // 아바타 고개끄덕거리기 (실망일 때는 잠깐 고개를 젓는다)
    const head = headRef.current;
    if (head) {
      const nod = isListening
        ? Math.sin(time * 5) * 0.07
        : Math.sin(time * 3) * 0.05;
      const sway = isListening
        ? Math.sin(time * 3) * 0.05
        : Math.sin(time * 0.6) * 0.05;
      const shakeLeft = headShakeUntilRef.current - performance.now() / 1000;
      const shake =
        shakeLeft > 0
          ? Math.sin(shakeLeft * 14) * 0.18 * Math.min(shakeLeft, 1)
          : 0;

      if (isHeadAnimatedRef.current) {
        // 애니메이션이 정한 회전 위에 더한다. 멈춰 둔 동작은 믹서가 머리를 다시 쓰지 않으므로,
        // 지난 프레임에 우리가 남긴 값 그대로면 기준 회전으로 되돌린 뒤 더한다(누적 방지).
        const lastSet = headLastSetRef.current;
        if (lastSet && head.quaternion.equals(lastSet)) {
          head.quaternion.copy(headRestRef.current);
        } else {
          headRestRef.current.copy(head.quaternion);
        }
        head.rotateX(nod * 0.6);
        head.rotateY(sway + shake);
        headLastSetRef.current = (headLastSetRef.current ?? new Quaternion()).copy(
          head.quaternion
        );
      } else {
        const baseHeadUp = -0.3; // 기본적으로 고개를 들게 하는 값
        head.rotation.x = baseHeadUp + nod;
        head.rotation.y = sway + shake;
      }
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
    <primitive object={gltf.scene} ref={avatarRef} />
  );
}

// Default export 추가
export default AvatarMesh;
