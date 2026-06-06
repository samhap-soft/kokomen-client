import { useCallback, useEffect, useState } from "react";

export type InterviewPhase =
  | "WAITING"
  | "KNOCKING"
  | "DOOR_OPENING"
  | "WALKING_IN"
  | "SITTING_DOWN"
  | "INTERVIEW";

interface UseInterviewPhaseOptions {
  onEntranceComplete?: () => void;
}

interface UseInterviewPhaseReturn {
  phase: InterviewPhase;
  startKnocking: () => void;
  startDoorOpening: () => void;
}

export function useInterviewPhase({
  onEntranceComplete
}: UseInterviewPhaseOptions = {}): UseInterviewPhaseReturn {
  const [phase, setPhase] = useState<InterviewPhase>("WAITING");

  const startKnocking = useCallback(() => {
    setPhase((current) => {
      if (current === "WAITING") return "KNOCKING";
      return current;
    });
  }, []);

  const startDoorOpening = useCallback(() => {
    setPhase((current) => {
      if (current === "KNOCKING" || current === "WAITING") {
        return "DOOR_OPENING";
      }
      return current;
    });
  }, []);

  useEffect(() => {
    if (phase === "DOOR_OPENING") {
      const timer = setTimeout(() => setPhase("WALKING_IN"), 1500);
      return () => clearTimeout(timer);
    }
    if (phase === "WALKING_IN") {
      const timer = setTimeout(() => setPhase("SITTING_DOWN"), 2500);
      return () => clearTimeout(timer);
    }
    if (phase === "SITTING_DOWN") {
      const timer = setTimeout(() => {
        setPhase("INTERVIEW");
        onEntranceComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, onEntranceComplete]);

  return { phase, startKnocking, startDoorOpening };
}
