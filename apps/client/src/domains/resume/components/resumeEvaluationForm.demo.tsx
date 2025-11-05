import { ResumeOutput } from "@kokomen/types";
import { Dispatch, SetStateAction } from "react";
import { CamelCasedProperties } from "@kokomen/types";
import { resumeEvaluationDemoResult } from "@/domains/resume/constants";
import { Button, Input } from "@kokomen/ui";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import z from "zod";
import { useForm } from "react-hook-form";
import { CloudUpload } from "lucide-react";

const jobCareers = ["0-1년", "1-3년", "3-5년", "5-10년", "10년 이상"];
const resumeEvalFormFields = z.object({
  resume: z.string(),
  portfolio: z.string().optional(),
  job_position: z.string().nonempty({ message: "지원 직무를 입력해주세요" }),
  job_description: z.string().optional(),
  job_career: z.enum(jobCareers as [string, ...string[]]).default("0-1년")
});
type ResumeEvalFormFields = z.infer<typeof resumeEvalFormFields>;

export default function ResumeEvaluationDemoForm({
  setResult
}: {
  setResult: Dispatch<
    SetStateAction<CamelCasedProperties<ResumeOutput> | null>
  >;
}) {
  const onClickSubmit = () => {
    setResult(resumeEvaluationDemoResult);
  };

  const form = useForm<ResumeEvalFormFields>({
    resolver: standardSchemaResolver(resumeEvalFormFields),
    defaultValues: {
      job_career: "0-1년",
      job_position: "프론트엔드 개발자",
      resume: "꼬꼬면 개발자_이력서.pdf",
      portfolio: "꼬꼬면 개발자_포트폴리오.pdf",
      job_description: `[주요 업무]
• React 기반 웹 애플리케이션 개발 및 유지보수
• TypeScript를 활용한 타입 안정성 확보
• Next.js를 이용한 SSR/SSG 구현
• 반응형 UI/UX 구현 및 성능 최적화
• RESTful API 연동 및 상태 관리

[자격 요건]
• React, TypeScript 실무 경험 1년 이상
• HTML5, CSS3, JavaScript ES6+ 능숙
• Git을 통한 협업 경험
• 웹 표준 및 크로스 브라우징 이해

[우대 사항]
• Next.js, Tailwind CSS 사용 경험
• 성능 최적화 및 번들 사이즈 관리 경험
• 디자인 시스템 구축 경험
• Jest, React Testing Library 등 테스트 경험`
    }
  });

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

        <form onSubmit={onClickSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-text-heading cursor-not-allowed"
                htmlFor="resume"
              >
                이력서 <span className="text-error">*</span>
              </label>
              <div className="w-full px-4 py-2.5 border border-border rounded-lg hover:bg-fill-secondary transition-colors text-left flex items-center justify-between group cursor-not-allowed">
                <span className="text-text-tertiary">
                  {form.getValues("resume")}
                </span>
                <CloudUpload className="w-5 h-5 text-text-tertiary group-hover:text-text-secondary transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-text-heading cursor-not-allowed"
                htmlFor="resume"
              >
                포트폴리오
              </label>
              <div className="w-full px-4 py-2.5 border border-border rounded-lg hover:bg-fill-secondary transition-colors text-left flex items-center justify-between group cursor-not-allowed">
                <span className="text-text-tertiary">
                  {form.getValues("portfolio")}
                </span>
                <CloudUpload className="w-5 h-5 text-text-tertiary group-hover:text-text-secondary transition-colors" />
              </div>
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
                disabled={true}
                className="w-full"
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
          <Button type="submit" size={"large"} className="w-full font-bold">
            이력서 분석하고 평가하기
          </Button>
        </form>
      </div>
    </div>
  );
}
