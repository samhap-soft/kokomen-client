import { FC, JSX, memo, MemoExoticComponent } from "react";
import { Modal } from "@kokomen/ui/components/modal";
import { Interview } from "@/domains/interview/types";
import { Button } from "@kokomen/ui/components/button";
import { useRouter } from "next/router";

type InterviewFinishModalProps = {
  interviewState: Interview["interview_state"];
  interviewId: number;
};
const InterviewFinishModal: MemoExoticComponent<FC<InterviewFinishModalProps>> =
  memo(
    ({
      interviewState,
      interviewId,
    }: InterviewFinishModalProps): JSX.Element => {
      const router = useRouter();
      return (
        <Modal
          isOpen={interviewState === "FINISHED"}
          onClose={() => {}}
          title="면접 종료"
          size={"2xl"}
          closeButton={false}
        >
          <div className="text-xl text-center p-4 mb-5">
            면접이 종료되었습니다.
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              role="button"
              aria-label="home-button"
              onClick={() => router.replace(`/`)}
              variant={"gradient"}
              size={"xl"}
              className="w-full"
            >
              홈으로
            </Button>
            <Button
              type="button"
              role="button"
              aria-label="go-to-result-button"
              onClick={() =>
                router.replace(`/interviews/${interviewId}/result`)
              }
              variant={"success"}
              size={"xl"}
              className="w-full"
            >
              면접 결과 확인하기
            </Button>
          </div>
        </Modal>
      );
    }
  );
InterviewFinishModal.displayName = "InterviewFinishModal";

export default InterviewFinishModal;
