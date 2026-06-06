import { Html } from "@react-three/drei";
import { JSX } from "react";

interface KnockButtonProps {
  onClick: () => void;
}

export default function KnockButton({
  onClick
}: KnockButtonProps): JSX.Element {
  return (
    <Html center position={[1.5, 1.2, -0.6]} zIndexRange={[50, 59]}>
      <button
        onClick={onClick}
        style={{
          padding: "16px 32px",
          fontSize: "18px",
          fontWeight: "bold",
          color: "#fff",
          background: "rgba(30, 30, 30, 0.85)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "12px",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          transition: "all 0.2s ease",
          whiteSpace: "nowrap"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(50, 50, 50, 0.95)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(30, 30, 30, 0.85)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        노크하기
      </button>
    </Html>
  );
}
