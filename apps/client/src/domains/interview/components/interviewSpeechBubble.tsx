import { useInterviewContext } from "@/domains/interview/components/interviewProvider";

export default function InterviewSpeechBubble() {
  const { message } = useInterviewContext();
  return (
    <div className="p-4 absolute top-10 left-[10%] w-3/4 h-36 text-center border flex items-center justify-center max-h-[150px] z-20 border-border-input rounded-xl bg-background-base">
      <div className="overflow-y-auto w-full max-h-full text-xl flex justify-center text-center align-middle">
        {message}
      </div>
    </div>
  );
}
