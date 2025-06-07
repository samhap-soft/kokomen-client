import { InterviewStatus } from "@/domains/interview/types";

const ROBOT_SOURCES: Record<InterviewStatus, { src: string; alt: string }> = {
  standby: {
    src: "/interview/robot_standby.png",
    alt: "Robot Standby",
  },
  thinking: {
    src: "/interview/robot_thinking.png",
    alt: "Robot Thinking",
  },
  question: {
    src: "/interview/robot_question.png",
    alt: "Robot question",
  },
  finished: {
    src: "/interview/robot_standby.png",
    alt: "Robot Finished",
  },
};

export { ROBOT_SOURCES };
