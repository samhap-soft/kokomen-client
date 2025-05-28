import { Layout } from "@kokomen/ui/components/common/Layout";
import { InterviewInput } from "@/domains/interview/components/interviewInput";
import { ArrowBigUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@kokomen/ui/components/button/Button";

export default function Interview() {
  const [interviewInputValue, setInterviewInputValue] = useState("");

  return (
    <Layout className="relative p-8">
      <div className="absolute bottom-10 gap-3 p-4 items-center w-3/4 left-[10%] border border-border-input rounded-xl">
        <InterviewInput
          onChange={(e) => setInterviewInputValue(e.target.value)}
          value={interviewInputValue}
        />
        <div className="flex w-full gap-5">
          <div className="flex-1"></div>
          <Button
            shadow={"none"}
            border={"round"}
            className="w-[50px] h-[50px]"
          >
            <ArrowBigUp className="text-primary-content" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
