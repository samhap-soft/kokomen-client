import { ArchiveButton } from "@/domains/resume/components/resumeArchiveButton";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ResumeAnalysisSubmitResult, UserInfo } from "@kokomen/types";
import { Button, FileField, Input, useToast } from "@kokomen/ui";
import { generateFormData } from "@kokomen/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { submitResumeAnalysis } from "@/domains/resume/api/resumeAnalysis";
import { publishResumeAnalysisEvent } from "@/domains/resume/utils/resumeAnalysisEventEmitter";
import { archiveKeys, resumeAnalysisKeys } from "@/utils/querykeys";
import { withApiErrorCapture } from "@/utils/error";
import useExtendedRouter from "@/hooks/useExtendedRouter";
import { isAxiosError } from "axios";
import { useResumeAnalysisStore } from "@/domains/resume/context/resumeAnalysisStore";

const jobCareers = ["0-1년", "1-3년", "3-5년", "5-10년", "10년 이상"];

// SSR 환경에서 FileList가 정의되지 않을 수 있으므로 custom 검증 사용
const fileListSchema: z.ZodTypeAny =
  typeof FileList !== "undefined"
    ? z.instanceof(FileList)
    : z.custom<FileList>((val): val is FileList => {
        return typeof FileList !== "undefined" && val instanceof FileList;
      });

const resumeCombinedFormFields = z
  .object({
    // FileList를 직접 받거나, 이미 업로드된 경우를 위해 optional 처리
    resume: fileListSchema.optional(),
    resume_id: z.string().optional(),

    portfolio: fileListSchema.optional(),
    portfolio_id: z.string().optional(),

    job_position: z.string().min(1, { message: "지원 직무를 입력해주세요" }),
    job_description: z.string().optional(),
    job_career: z.enum(jobCareers as [string, ...string[]]).default("0-1년")
  })
  // 1. 이력서 검증: ID가 있거나, 파일이 선택되었거나
  .refine((data) => data.resume_id || (data.resume && data.resume.length > 0), {
    message: "이력서를 선택해주세요",
    path: ["resume"] // 에러 메시지를 표시할 필드 위치
  });
type ResumeCombinedFormFields = z.infer<typeof resumeCombinedFormFields>;

export default function ResumeCombinedForm({
  user
}: {
  user: UserInfo | null;
}): React.JSX.Element {
  const { toast } = useToast();
  const { analysisState } = useResumeAnalysisStore();
  const form = useForm<ResumeCombinedFormFields>({
    resolver: standardSchemaResolver(resumeCombinedFormFields),
    defaultValues: {
      job_career: "0-1년"
    }
  });
  const [displayName, setDisplayName] = useState<{
    resume: string;
    portfolio: string;
  }>({ resume: "", portfolio: "" });

  useEffect(() => {
    const resume = form.getValues("resume");
    const portfolio = form.getValues("portfolio");
    if (resume instanceof FileList && resume.length > 0) {
      setDisplayName({ ...displayName, resume: "" });
      form.setValue("resume_id", "");
    }
    if (portfolio instanceof FileList && portfolio.length > 0) {
      setDisplayName({ ...displayName, portfolio: "" });
      form.setValue("portfolio_id", "");
    }
  }, [form.watch("resume_id"), form.watch("portfolio_id")]);

  const queryClient = useQueryClient();
  const router = useExtendedRouter();
  const mutation = useMutation<ResumeAnalysisSubmitResult, Error, FormData>({
    mutationFn: submitResumeAnalysis,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: archiveKeys.resumes("ALL") });
      // 마이페이지 히스토리에 새 분석이 바로 보이도록
      queryClient.invalidateQueries({ queryKey: resumeAnalysisKeys.all });
      // 폴링은 앱 최상단 스토어가 담당하므로 페이지를 벗어나도 결과 알림을 받을 수 있다
      publishResumeAnalysisEvent("resumeAnalysis:submitted", {
        analysis_id: data.analysisId,
        guest_token: data.guestToken
      });
      form.reset({ job_career: "0-1년" });
      setDisplayName({ resume: "", portfolio: "" });
    },
    onError: withApiErrorCapture((error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.navigateToLogin();
          return;
        }
        // 비회원 1회 제한, 토큰 부족 등 서버가 알려주는 사유는 그대로 노출
        const message = (
          error.response?.data as { message?: string } | undefined
        )?.message;
        if (message) {
          toast({
            title: "이력서 분석 실패",
            description: message,
            variant: "error"
          });
          return;
        }
      }
      toast({
        title: "이력서 분석 실패",
        description:
          "이력서 분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요",
        variant: "error"
      });
    })
  });

  function onSubmit(data: ResumeCombinedFormFields): void {
    mutation.mutate(generateFormData(data));
  }

  const onclickArchiveButton = (data: {
    resume_id?: string;
    resume_name?: string;
    portfolio_id?: string;
    portfolio_name?: string;
  }): void => {
    if (data.resume_id) {
      form.setValue("resume_id", data.resume_id);
      setDisplayName({
        ...displayName,
        resume: data.resume_name || ""
      });
    }
    if (data.portfolio_id) {
      form.setValue("portfolio_id", data.portfolio_id);
      setDisplayName({
        ...displayName,
        portfolio: data.portfolio_name || ""
      });
    }
  };

  // 제출 요청 중이거나 분석 폴링이 진행되는 동안은 중복 제출을 막는다
  const isPending = mutation.isPending || analysisState === "PENDING";

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-heading">이력서 분석</h1>
          <p className="text-text-secondary">
            이력서와 포트폴리오를 업로드하고 지원하려는 직무 정보를 입력하면,
            이력서 평가와 이력서 기반 면접 질문을 한 번에 받아볼 수 있어요.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileField
                label="이력서"
                required
                register={form.register("resume")}
                error={form.formState.errors.resume?.message as string}
                hint="PDF 파일만 업로드 가능합니다"
                displayName={displayName.resume}
              />
              <ArchiveButton
                type="RESUME"
                onClickResume={onclickArchiveButton}
                isLoggedIn={user !== null}
              />
            </div>

            <div className="flex items-center gap-2">
              <FileField
                label="포트폴리오"
                register={form.register("portfolio")}
                hint="선택사항입니다"
                displayName={displayName.portfolio}
              />
              <ArchiveButton
                type="PORTFOLIO"
                onClickResume={onclickArchiveButton}
                isLoggedIn={user !== null}
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-text-heading"
                htmlFor="job_position"
              >
                지원 직무 <span className="text-error">*</span>
              </label>
              <Input
                type="text"
                placeholder="예: 프론트엔드 개발자"
                {...form.register("job_position")}
                className="w-full"
              />
              {form.formState.errors.job_position && (
                <p className="text-xs text-error">
                  {form.formState.errors.job_position.message}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-text-heading"
                htmlFor="job_career"
              >
                연차
              </label>
              <div className="flex gap-2">
                {jobCareers.map((career) => (
                  <Button
                    type="button"
                    variant={
                      form.getValues("job_career") === career
                        ? "primary"
                        : "glass"
                    }
                    key={career}
                    onClick={() => {
                      form.setValue("job_career", career);
                      form.trigger("job_career");
                    }}
                  >
                    {career}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-text-heading"
                htmlFor="job_description"
              >
                채용 공고
              </label>
              <textarea
                placeholder="채용 공고의 직무 설명을 입력해주세요"
                {...form.register("job_description")}
                className="w-full min-h-32 px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <Button
            type="submit"
            size={"large"}
            className="w-full"
            disabled={isPending}
          >
            {isPending
              ? "이력서 분석 중입니다..."
              : "이력서 분석하고 평가 · 면접 질문 받기"}
          </Button>
        </form>
      </div>
    </div>
  );
}
