/* eslint-disable react/no-unknown-property */
import { useGLTF } from "@react-three/drei";
import { useFrame, Canvas } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { useScreenSize } from "@kokomen/utils";
import * as THREE from "three";

function RobotModel() {
  const { scene, animations } = useGLTF("/robotModel.glb");
  const meshRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  // 애니메이션 설정
  useEffect(() => {
    if (meshRef.current && animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(meshRef.current);

      // 모든 애니메이션을 믹서에 추가
      animations.forEach((clip) => {
        const action = mixerRef.current!.clipAction(clip);
        action.play();
      });
    }
  }, [animations]);

  // 애니메이션 업데이트
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <group ref={meshRef}>
      <primitive
        object={scene}
        rotation={[0, 5, 0]}
        position={[-1, 0, 0]}
        scale={0.8}
      />
    </group>
  );
}

function Robot() {
  const { isMobile } = useScreenSize();
  return (
    <div className="w-full h-full relative">
      <Canvas
        className={"w-full"}
        camera={{ position: [-5, 3, 0], fov: 40 }}
        style={{
          width: "100%",
          height: isMobile ? "500px" : "1000px"
        }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <RobotModel />
      </Canvas>
    </div>
  );
}

export default Robot;
