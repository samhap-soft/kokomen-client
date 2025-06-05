import { useInterviewContext } from "@/domains/interview/components/interviewProvider";
import { InterviewStatus } from "@/domains/interview/types";
import Image from "next/image";

const ROBOT_SOURCES: Record<InterviewStatus, { src: string; alt: string }> = {
  beforeStart: {
    src: "/interview/robot_standby.png",
    alt: "Robot Standby",
  },
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
export default function Robots() {
  const { status } = useInterviewContext();

  return (
    <div className="absolute top-[25%] left-[30%] w-[40%] z-10">
      {Object.entries(ROBOT_SOURCES).map(([key, { src, alt }]) => (
        <Image
          key={key}
          src={src}
          alt={alt}
          width={300}
          height={300}
          className={`w-full absolute top-0 left-0 ${
            status === key ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          priority={key === "standby"}
        />
      ))}
    </div>
  );
}
