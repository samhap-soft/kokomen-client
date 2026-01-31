import { generateResumeBasedInterviewQuestion } from "@/domains/resume/api";
import { ArchiveButton } from "@/domains/resume/components/resumeArchiveButton";
import useExtendedRouter from "@/hooks/useExtendedRouter";
import { withApiErrorCapture } from "@/utils/error";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { generateFormData } from "@kokomen/utils";
import { CamelCasedProperties, UserInfo } from "@kokomen/types";
import { Button, FileField, useToast } from "@kokomen/ui";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { publishResumeBasedInterviewEvent } from "@/domains/resume/utils/resumeInterviewEventEmitter";

const jobCareers = ["0-1년", "1-3년", "3-5년", "5-10년", "10년 이상"];

// SSR 환경에서 FileList가 정의되지 않을 수 있으므로 custom 검증 사용
const fileListSchema: z.ZodTypeAny =
  typeof FileList !== "undefined"
    ? z.instanceof(FileList)
    : z.custom<FileList>((val): val is FileList => {
        return typeof FileList !== "undefined" && val instanceof FileList;
      });

const resumeBasedInterviewFormFields = z
  .object({
    // FileList를 직접 받거나, 이미 업로드된 경우를 위해 optional 처리
    resume: fileListSchema.optional(),
    resume_id: z.string().optional(),

    portfolio: fileListSchema.optional(),
    portfolio_id: z.string().optional(),

    job_career: z.enum(jobCareers as [string, ...string[]]).default("0-1년")
  })
  // 1. 이력서 검증: ID가 있거나, 파일이 선택되었거나
  .refine((data) => data.resume_id || (data.resume && data.resume.length > 0), {
    message: "이력서를 선택해주세요",
    path: ["resume"] // 에러 메시지를 표시할 필드 위치
  });
type ResumeBasedInterviewFormFields = z.infer<
  typeof resumeBasedInterviewFormFields
>;

export default function ResumeBasedInterviewForm({ user }: { user: UserInfo }) {
  const { toast } = useToast();
  const form = useForm<ResumeBasedInterviewFormFields>({
    resolver: standardSchemaResolver(resumeBasedInterviewFormFields),
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

  const router = useExtendedRouter();
  const mutation = useMutation<
    CamelCasedProperties<{ resume_based_interview_result_id: number }>,
    Error,
    FormData
  >({
    mutationFn: generateResumeBasedInterviewQuestion,
    onSuccess: (data) => {
      publishResumeBasedInterviewEvent("resumeBasedInterview:submitted", {
        resume_based_interview_result_id: data.resumeBasedInterviewResultId
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

  async function onSubmit(data: ResumeBasedInterviewFormFields) {
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
  const onclickArchiveButton = (data: {
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
  };

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
          </div>
          <Button
            type="submit"
            size={"large"}
            className="w-full"
            disabled={isPending}
          >
            이력서 분석하고 면접 질문 생성하기
          </Button>
        </form>
      </div>
    </div>
  );
}
