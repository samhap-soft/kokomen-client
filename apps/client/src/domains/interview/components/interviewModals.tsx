import { Modal } from "@kokomen/ui/components/modal";
import { Button } from "@kokomen/ui/components/button";
import { useInterviewContext } from "@/domains/interview/components/interviewProvider";
import { useRouter } from "next/router";
export default function InterviewModals() {
  return <StartNewInterviewModal />;
}

function StartNewInterviewModal() {
  const { interviewStartup, status } = useInterviewContext();
  const router = useRouter();
  return (
    <Modal visible={status === "beforeStart"}>
      <div className="flex flex-col items-center justify-center p-8 w-1/2 min-w-[450px] bg-background-base rounded-xl">
        <h2 className="text-2xl font-bold mb-4">인터뷰 시작하기</h2>
        <p className="text-lg">인터뷰를 시작합니다. 준비 되셨나요?</p>
        <div className="mt-8 flex gap-4 w-full">
          <Button
            className="w-full"
            size={"lg"}
            variant={"red"}
            onClick={() => router.back()}
          >
            나가기
          </Button>
          <Button
            className="w-full"
            variant={"default"}
            size={"lg"}
            onClick={() => interviewStartup()}
          >
            시작하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
