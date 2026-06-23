import { Text } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { JSX, useRef, useState } from "react";
import * as THREE from "three";

interface LiveCodingPaperProps {
  onClick: () => void;
}

/**
 * 면접관 정면(책상 위)에 3D 종이를 띄워, 클릭하면 라이브 코딩 인터페이스를 연다.
 * 카메라가 INTERVIEW 단계에서 +X 방향(면접관)을 바라보므로,
 * 종이는 사용자(-X쪽)를 향하도록 배치한다.
 */
export default function LiveCodingPaper({
  onClick
}: LiveCodingPaperProps): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<boolean>(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // hover 시 살짝 떠오르고 커지는 피드백
    const targetLift = hovered ? 0.04 : 0;
    const targetScale = hovered ? 1.05 : 1;
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      0.86 + targetLift,
      delta * 8
    );
    const nextScale = THREE.MathUtils.lerp(
      groupRef.current.scale.x,
      targetScale,
      delta * 8
    );
    groupRef.current.scale.setScalar(nextScale);
  });

  const handleOver = (e: ThreeEvent<PointerEvent>): void => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handleOut = (e: ThreeEvent<PointerEvent>): void => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>): void => {
    e.stopPropagation();
    onClick();
  };

  return (
    <group
      ref={groupRef}
      position={[3.75, 0.86, -3.1]}
      // 사용자를 향하도록(-X) 회전 + 책상 위에 놓인 듯 뒤로 살짝 눕힘
      rotation={[-Math.PI / 2 + 0.35, -Math.PI / 2, 0]}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onClick={handleClick}
    >
      {/* 종이 본체 */}
      <mesh castShadow>
        <boxGeometry args={[0.32, 0.44, 0.004]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.85}
          emissive={hovered ? "#7c93ff" : "#000000"}
          emissiveIntensity={hovered ? 0.25 : 0}
        />
      </mesh>

      {/* 제목 텍스트 */}
      <Text
        position={[0, 0.13, 0.004]}
        fontSize={0.035}
        color="#1f2937"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.28}
        textAlign="center"
      >
        Code Interview
      </Text>

      {/* 본문 느낌의 가짜 텍스트 라인들 */}
      {[0.04, 0, -0.04, -0.08, -0.12].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0.004]}>
          <planeGeometry args={[idx % 2 === 0 ? 0.24 : 0.2, 0.012]} />
          <meshBasicMaterial color="#d1d5db" />
        </mesh>
      ))}

      {/* 안내 문구 */}
      <Text
        position={[0, -0.175, 0.004]}
        fontSize={0.024}
        color={hovered ? "#4f46e5" : "#6b7280"}
        anchorX="center"
        anchorY="middle"
      >
        눌러서 코드 작성하기
      </Text>
    </group>
  );
}
