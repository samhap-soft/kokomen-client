import { InterviewHistory } from "@kokomen/types";

function InterviewStatusBadge({
  interviewStatus
}: {
  interviewStatus: InterviewHistory["interview_state"];
}) {
  if (interviewStatus === "FINISHED") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        완료
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      진행중
    </span>
  );
}

export { InterviewStatusBadge };
