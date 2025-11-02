import { submitResumeEvaluation } from "@/domains/resume/api";
import useExtendedRouter from "@/hooks/useExtendedRouter";
// import { resumeEvaluationDemoResult } from "@/domains/resume/constants";
import { withApiErrorCapture } from "@/utils/error";
import { parsePdf } from "@/utils/pdf";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  CamelCasedProperties,
  ResumeInput,
  ResumeOutput
} from "@kokomen/types";
import { Button, FileField, Input, useToast } from "@kokomen/ui";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const ResumeEvaluationLoading = () => (
  <div className="fixed inset-0 w-full flex items-center justify-center flex-col gap-8 bg-black/50">
    <Image
      src="/kokomenReport.png"
      alt="kokomenReport"
      width={300}
      height={300}
    />
    <div className="text-lg space-y-2 text-text-light-solid text-center">
      <p>보고서를 생성하는 중이에요. 잠시만 기다려주세요.</p>
      <p>최대 1분까지 소요될 수 있어요</p>
    </div>
  </div>
);

const jobCareers = ["0-1년", "1-3년", "3-5년", "5-10년", "10년 이상"];
const resumeEvalFormFields = z.object({
  resume: z.instanceof(FileList).refine((fileList) => fileList.length > 0, {
    message: "이력서를 업로드해주세요"
  }),
  portfolio: z.instanceof(FileList).optional(),
  job_position: z.string().nonempty({ message: "지원 직무를 입력해주세요" }),
  job_description: z.string().optional(),
  job_career: z.enum(jobCareers as [string, ...string[]]).default("0-1년")
});
type ResumeEvalFormFields = z.infer<typeof resumeEvalFormFields>;

export default function ResumeEvaluationForm({
  setResult
}: {
  setResult: Dispatch<
    SetStateAction<CamelCasedProperties<ResumeOutput> | null>
  >;
}) {
  const { toast } = useToast();
  const form = useForm<ResumeEvalFormFields>({
    resolver: standardSchemaResolver(resumeEvalFormFields),
    defaultValues: {
      job_career: "0-1년"
    }
  });
  const router = useExtendedRouter();
  const mutation = useMutation<
    CamelCasedProperties<ResumeOutput>,
    Error,
    ResumeInput
  >({
    mutationFn: (data) => submitResumeEvaluation(data),
    onSuccess: (data) => {
      form.reset();
      setResult(data);
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
      let resume = "";
      let portfolio = "";
      if (data.portfolio && data.portfolio?.length > 0) {
        const parsedFiles = await parsePdf([
          data.resume[0],
          data.portfolio[0]
        ] as File[]);
        resume = parsedFiles[0];
        portfolio = parsedFiles[1];
      } else {
        resume = await parsePdf(data.resume[0] as File);
      }

      mutation.mutate({
        resume: resume,
        portfolio: portfolio,
        job_position: data.job_position,
        job_description: data.job_description || "",
        job_career: data.job_career
      });
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
            <FileField
              label="이력서"
              required
              register={form.register("resume")}
              error={form.formState.errors.resume?.message}
              hint="PDF 파일만 업로드 가능합니다"
            />

            <FileField
              label="포트폴리오"
              register={form.register("portfolio")}
              hint="선택사항입니다"
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
      {isPending && <ResumeEvaluationLoading />}
    </div>
  );
}
