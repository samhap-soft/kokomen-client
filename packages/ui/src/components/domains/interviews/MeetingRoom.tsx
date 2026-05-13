import { useGLTF } from "@react-three/drei";
import { JSX, useEffect } from "react";

interface MeetingRoomProps {
  url: string;
}

export default function MeetingRoom({ url }: MeetingRoomProps): JSX.Element {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.name.startsWith("3DGeom")) {
        child.visible = false;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}
