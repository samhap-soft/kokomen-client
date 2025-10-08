import { Button } from "@kokomen/ui";
import {
  Html,
  OrbitControls,
  RoundedBox,
  Text,
  useGLTF
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Group } from "three";
import * as THREE from "three";

export default function ResumeSelectMenu3d() {
  return (
    <Canvas
      className={"w-full"}
      camera={{ position: [-6, 1, 2], fov: 40 }}
      style={{
        width: "100%",
        height: "1000px"
      }}
    >
      <NormalViewButton />
      {/* <ambientLight intensity={10} /> */}
      <Kokomen3D />
      <ResumeEval />
      <ResumeInterview />
      <directionalLight position={[10, 10, 5]} intensity={6} />
      <directionalLight position={[-10, -10, -5]} intensity={6} />
      <directionalLight position={[0, 10, 0]} intensity={6} />
      <directionalLight position={[0, -10, 0]} intensity={6} />
      <directionalLight position={[0, 0, 10]} intensity={6} />
      <directionalLight position={[0, 0, -10]} intensity={6} />
      <OrbitControls enablePan={false} enableZoom={false} enableRotate={true} />
    </Canvas>
  );
}

const NormalViewButton = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handleClick = () => {
    const params = new URLSearchParams(searchParams);
    params.set("view", "normal");
    router.push(`/resume?${params.toString()}`);
  };
  return (
    <Html fullscreen>
      <Button
        variant="outline"
        className="absolute top-4 left-4 z-10 px-4"
        onClick={handleClick}
      >
        일반으로 보기
      </Button>
    </Html>
  );
};

const Kokomen3D = () => {
  const object = useGLTF(
    `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/models/kokomen3d.glb`
  );
  return (
    <primitive
      object={object.scene}
      position={[0, 0, 0]}
      scale={1}
      rotation={[0, 3.5, 0]}
    />
  );
};

const ResumeEval = () => {
  const object = useGLTF(
    `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/models/report3d.glb`
  );
  const groupRef = useRef<Group>(null);
  const router = useRouter();
  const [targetScale, setTargetScale] = useState(0.2);

  useFrame(() => {
    object.scene.rotation.y += 0.01;

    if (groupRef.current) {
      const currentScale = groupRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
      groupRef.current.scale.set(newScale, newScale, newScale);
    }
  });

  const handlePointerEnter = () => {
    document.body.style.cursor = "pointer";
    setTargetScale(0.25);
  };
  const handlePointerLeave = () => {
    document.body.style.cursor = "default";
    setTargetScale(0.2);
  };
  const handleClick = () => {
    router.push("/resume/eval");
  };

  return (
    <>
      <group
        ref={groupRef}
        position={[0, 1.8, 0]}
        rotation={[0, -1.2, 0]}
        scale={0.2}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        {/* 말풍선 배경 */}
        <RoundedBox
          args={[5, 1.5, 0.2]}
          radius={0.2}
          smoothness={4}
          position={[0, 0, -0.1]}
        >
          <meshStandardMaterial color="#bae0ff" />
        </RoundedBox>

        {/* 말풍선 테두리 */}
        <RoundedBox
          args={[5.1, 1.6, 0.15]}
          radius={0.2}
          smoothness={4}
          position={[0, 0, -0.15]}
        >
          <meshStandardMaterial color="#1677ff" />
        </RoundedBox>

        {/* 텍스트 */}
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.3}
          color="#333333"
          anchorX="center"
          anchorY="middle"
          maxWidth={5.5}
          textAlign="center"
        >
          이력서와 포트폴리오 평가하기
        </Text>
        <primitive
          object={object.scene}
          position={[0, -3, 0]}
          scale={3}
          rotation={[0, 3.5, 0]}
        />
      </group>
    </>
  );
};

const ResumeInterview = () => {
  const object = useGLTF(
    `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/models/resumeInterview.glb`
  );
  const groupRef = useRef<Group>(null);
  const router = useRouter();
  const [targetScale, setTargetScale] = useState(0.2);

  useFrame(() => {
    object.scene.rotation.y += 0.01;

    if (groupRef.current) {
      const currentScale = groupRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
      groupRef.current.scale.set(newScale, newScale, newScale);
    }
  });

  const handlePointerEnter = () => {
    document.body.style.cursor = "pointer";
    setTargetScale(0.25);
  };
  const handlePointerLeave = () => {
    document.body.style.cursor = "default";
    setTargetScale(0.2);
  };
  const handleClick = () => {
    router.push("/resume/interview");
  };

  return (
    <>
      <group
        ref={groupRef}
        position={[0, -1, 0]}
        rotation={[0, -1.2, 0]}
        scale={0.2}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        {/* 말풍선 배경 */}
        <RoundedBox
          args={[5, 1.5, 0.2]}
          radius={0.2}
          smoothness={4}
          position={[0, 0, -0.1]}
        >
          <meshStandardMaterial color="#bae0ff" />
        </RoundedBox>

        {/* 말풍선 테두리 */}
        <RoundedBox
          args={[5.1, 1.6, 0.15]}
          radius={0.2}
          smoothness={4}
          position={[0, 0, -0.15]}
        >
          <meshStandardMaterial color="#1677ff" />
        </RoundedBox>

        {/* 텍스트 */}
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.3}
          color="#333333"
          anchorX="center"
          anchorY="middle"
          maxWidth={5.5}
          textAlign="center"
        >
          이력서와 포트폴리오 기반 면접보기
        </Text>
        <primitive
          object={object.scene}
          position={[0, -3, 0]}
          scale={3}
          rotation={[0, 3.5, 0]}
        />
      </group>
    </>
  );
};
