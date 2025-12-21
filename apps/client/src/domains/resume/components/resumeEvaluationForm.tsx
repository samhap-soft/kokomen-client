import { submitResumeEvaluation } from "@/domains/resume/api";
import { ArchiveButton } from "@/domains/resume/components/resumeArchiveButton";
import useExtendedRouter from "@/hooks/useExtendedRouter";
import { withApiErrorCapture } from "@/utils/error";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { generateFormData } from "@kokomen/utils";
import { CamelCasedProperties, UserInfo } from "@kokomen/types";
import { Button, FileField, Input, useToast } from "@kokomen/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { archiveKeys } from "@/utils/querykeys";
import { publishReportEvent } from "@/domains/resume/utils/reportEventEmitter";

const jobCareers = ["0-1년", "1-3년", "3-5년", "5-10년", "10년 이상"];
const resumeEvalFormFields = z
  .object({
    resume: z.instanceof(FileList),
    resume_id: z.string().optional(),
    portfolio: z.instanceof(FileList),
    portfolio_id: z.string().optional(),
    job_position: z.string().nonempty({ message: "지원 직무를 입력해주세요" }),
    job_description: z.string().optional(),
    job_career: z.enum(jobCareers as [string, ...string[]]).default("0-1년")
  })
  .refine((data) => data.resume_id || data.resume.length > 0, {
    message: "이력서를 선택해주세요"
  })
  .refine((data) => data.portfolio_id || data.portfolio, {
    message: "포트폴리오를 선택해주세요"
  });
type ResumeEvalFormFields = z.infer<typeof resumeEvalFormFields>;

export default function ResumeEvaluationForm({ user }: { user: UserInfo }) {
  const { toast } = useToast();
  const form = useForm<ResumeEvalFormFields>({
    resolver: standardSchemaResolver(resumeEvalFormFields),
    defaultValues: {
      job_career: "0-1년"
    }
  });
  const [displayName, setDisplayName] = useState<{
    resume: string;
    portfolio: string;
  }>({ resume: "", portfolio: "" });

  useEffect(() => {
    if (
      form.getValues("resume") instanceof FileList &&
      form.getValues("resume").length > 0
    ) {
      setDisplayName({ ...displayName, resume: "" });
      form.setValue("resume_id", undefined);
    }
    if (
      form.getValues("portfolio") instanceof FileList &&
      form.getValues("portfolio").length > 0
    ) {
      setDisplayName({ ...displayName, portfolio: "" });
      form.setValue("portfolio_id", undefined);
    }
  }, [form.watch("resume_id"), form.watch("portfolio_id")]);

  const queryClient = useQueryClient();
  const router = useExtendedRouter();
  const mutation = useMutation<
    CamelCasedProperties<{ evaluation_id: string }>,
    Error,
    FormData
  >({
    mutationFn: submitResumeEvaluation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: archiveKeys.resumes("ALL") });
      publishReportEvent("report:submitted", {
        evaluation_id: data.evaluationId
      });
      toast({
        title: "이력서 분석 중입니다. 잠시 후 평가 결과를 알려드려요",
        variant: "info"
      });
      router.replace({
        pathname: "/resume"
      });
    },
    onError: withApiErrorCapture((error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        router.navigateToLogin();
        return;
      } else {
        toast({
          title: "이력서 분석 실패",
          description:
            "이력서 분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요",
          variant: "error"
        });
      }
    })
  });
  const [isParsing, setIsParsing] = useState(false);

  async function onSubmit(data: ResumeEvalFormFields) {
    try {
      setIsParsing(true);
      const formData = generateFormData(data);
      mutation.mutate(formData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsParsing(false);
    }
  }

  const isPending = isParsing || mutation.isPending;

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-heading">이력서 평가</h1>
          <p className="text-text-secondary">
            이력서와 포트폴리오를 업로드하고, 지원하려는 직무 정보를
            입력해주세요.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileField
                label="이력서"
                required
                register={form.register("resume")}
                error={form.formState.errors.resume?.message}
                hint="PDF 파일만 업로드 가능합니다"
                displayName={displayName.resume}
              />
              <ArchiveButton
                onClickResume={(data: {
                  resume_id?: string;
                  resume_name?: string;
                  portfolio_id?: string;
                  portfolio_name?: string;
                }) => {
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
                }}
                isLoggedIn={user !== null}
              />
            </div>

            <FileField
              label="포트폴리오"
              register={form.register("portfolio")}
              hint="선택사항입니다"
              displayName={displayName.portfolio}
            />

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
            이력서 분석하고 평가하기
          </Button>
        </form>
      </div>
    </div>
  );
}
