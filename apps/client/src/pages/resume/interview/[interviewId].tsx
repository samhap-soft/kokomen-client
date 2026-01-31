import Header from "@/shared/header";
import { getUserInfo } from "@/domains/auth/api";
import { UserInfo } from "@kokomen/types";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { Footer } from "@/shared/footer";
import { AxiosError } from "axios";
import { SEO } from "@/shared/seo";
import { getResumeInterviewResult } from "@/domains/resume/api/resumeBasedInterview";
import { ResumeBasedInterviewQuestion } from "@kokomen/types";
import { Button, useToast } from "@kokomen/ui";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { createResumeBasedInterview } from "@/domains/resume/api/resumeBasedInterview";
import { InterviewMode } from "@kokomen/types";
import { useState } from "react";
import ResumeInterviewModeSelectModal from "@/domains/resume/components/resumeInterviewModeSelectModal";
import { withApiErrorCapture } from "@/utils/error";
import useExtendedRouter from "@/hooks/useExtendedRouter";
import { MessageSquare } from "lucide-react";

export default function ResumeInterviewResultPage({
  userInfo,
  questions,
  interviewId
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { toast } = useToast();
  const extendedRouter = useExtendedRouter();
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null
  );
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);

  const createInterviewMutation = useMutation({
    mutationFn: ({
      generatedQuestionId,
      mode
    }: {
      generatedQuestionId: number;
      mode: InterviewMode;
    }) =>
      createResumeBasedInterview({
        resumeBasedInterviewResultId: Number(interviewId),
        generatedQuestionId,
        maxQuestionCount: questions.length,
        mode
      }),
    onSuccess: (data) => {
      const mode = "cur_question" in data ? "TEXT" : "VOICE";
      router.push(`/interviews/${data.interview_id}?mode=${mode}`);
    },
    onError: withApiErrorCapture((error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        extendedRouter.navigateToLogin();
        return;
      }
      toast({
        title: "면접 생성 실패",
        description:
          "면접 생성 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        variant: "error"
      });
    })
  });

  const handleStartInterview = (questionId: number): void => {
    setSelectedQuestionId(questionId);
    setIsModeModalOpen(true);
  };

  const handleSelectMode = (mode: InterviewMode): void => {
    if (selectedQuestionId === null) return;

    createInterviewMutation.mutate({
      generatedQuestionId: selectedQuestionId,
      mode
    });
  };

  return (
    <>
      <SEO
        title="이력서 기반 면접 질문"
        description="생성된 면접 질문을 확인하고 면접을 시작해보세요."
        image="/resume-interview.png"
        robots="index, follow"
        pathname={`/resume/interview/${interviewId}`}
      />
      <main className="min-h-screen">
        <Header user={userInfo} />
        <div className="container mx-auto px-6 pt-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-text-heading">
                  생성된 면접 질문
                </h1>
                <p className="text-text-secondary">
                  이력서를 기반으로 생성된 면접 질문입니다. 질문을 선택하여
                  면접을 시작해보세요.
                </p>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <h3 className="text-lg font-semibold text-text-heading">
                            질문 {index + 1}
                          </h3>
                        </div>
                        <p className="text-text-primary pl-10">
                          {question.question}
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="large"
                        onClick={() => handleStartInterview(question.id)}
                        disabled={createInterviewMutation.isPending}
                        className="flex-shrink-0"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        면접 시작하기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>

      <ResumeInterviewModeSelectModal
        isOpen={isModeModalOpen}
        onClose={() => {
          setIsModeModalOpen(false);
          setSelectedQuestionId(null);
        }}
        onSelectMode={handleSelectMode}
      />
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<
  GetServerSidePropsResult<{
    userInfo: UserInfo | null;
    questions: ResumeBasedInterviewQuestion[];
    interviewId: string;
  }>
> => {
  const { interviewId } = context.params as { interviewId: string };
  const interviewIdNumber = parseInt(interviewId, 10);

  if (isNaN(interviewIdNumber)) {
    return {
      notFound: true
    };
  }

  try {
    const [userInfoResult, questionsResult] = await Promise.all([
      getUserInfo(context)
        .then((res) => res.data)
        .catch((error) => {
          if (error instanceof AxiosError && error.response?.status === 401) {
            return null;
          }
          throw error;
        }),
      getResumeInterviewResult(interviewIdNumber, context)
    ]);

    return {
      props: {
        userInfo: userInfoResult,
        questions: questionsResult as ResumeBasedInterviewQuestion[],
        interviewId
      }
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      return {
        redirect: {
          destination: "/login",
          permanent: false
        }
      };
    }
    if (error instanceof AxiosError) {
      if (error.response?.status === 404 || error.response?.status === 403) {
        return {
          notFound: true
        };
      }
    }
    throw error;
  }
};
