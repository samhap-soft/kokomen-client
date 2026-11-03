import { toggleMemberInterviewLike } from "@/domains/members/api";
import { useMutation } from "@tanstack/react-query";
import { JSX, useState } from "react";
import { isAxiosError } from "axios";
import { Button, HeartFilledIcon, HeartIcon, useToast } from "@kokomen/ui";
import { MemberInterviewResult } from "@kokomen/types";
import { CamelCasedProperties } from "@/utils/convertConvention";
import { captureButtonEvent } from "@/utils/analytics";
import { useRouter } from "next/router";

export default function MemberTotalFeedback({
  result,
  interviewId
}: {
  result: CamelCasedProperties<MemberInterviewResult>;
  interviewId: number;
}): JSX.Element {
  const [isTotalLikedIncludesMine, setIsTotalLikedIncludesMine] =
    useState<boolean>(result.interviewAlreadyLiked);
  const [totalLikedCount, setTotalLikedCount] = useState<number>(
    result.interviewLikeCount
  );
  const router = useRouter();
  const { error: errorToast } = useToast();
  const { mutate: toggleInterviewLikeMutation, isPending } = useMutation({
    mutationFn: (liked: boolean) =>
      toggleMemberInterviewLike(liked, interviewId),
    onMutate: () => {
      captureButtonEvent({
        name: "MemberInterviewLike",
        properties: {
          type: "interview",
          likedInterviewId: interviewId,
          liked: !isTotalLikedIncludesMine
        }
      });
      setIsTotalLikedIncludesMine(!isTotalLikedIncludesMine);
      setTotalLikedCount(
        isTotalLikedIncludesMine ? totalLikedCount - 1 : totalLikedCount + 1
      );
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push(`/login?redirectTo=${router.asPath}`);
          return;
        }
        errorToast({
          title: "좋아요 실패",
          description: error.response?.data.message
        });
      } else {
        errorToast({
          title: "좋아요 실패",
          description: "서버 오류가 발생했습니다."
        });
      }
      setIsTotalLikedIncludesMine(!isTotalLikedIncludesMine);
      setTotalLikedCount(
        isTotalLikedIncludesMine ? totalLikedCount + 1 : totalLikedCount - 1
      );
    }
  });

  const metrics: { label: string; value: string; highlight?: boolean }[] = [
    { label: "총점", value: `${result.totalScore}점`, highlight: true },
    { label: "질문 수", value: `${result.feedbacks.length}개` },
    { label: "좋아요", value: `${totalLikedCount}` },
    { label: "조회수", value: `${result.interviewViewCount}` }
  ];

  return (
    <section className="flex flex-col gap-6 rounded-[20px] border border-border bg-bg-elevated p-6 md:p-8">
      <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col gap-1.5">
            <dt className="text-sm text-text-secondary">{metric.label}</dt>
            <dd
              className={`text-3xl font-bold ${
                metric.highlight ? "text-primary" : "text-text-primary"
              }`}
            >
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
      <hr className="border-border" />
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-text-primary">종합 평가</h2>
        {/* Figma 에는 면접 단위 좋아요 버튼이 없지만 기존 기능을 유지하려고 질문별 좋아요와 같은 모양으로 둔다 */}
        <Button
          variant="secondary"
          aria-busy={isPending}
          aria-pressed={isTotalLikedIncludesMine}
          aria-label="전체 인터뷰 좋아요"
          name={`interview-like-button-${interviewId}`}
          type="button"
          onClick={() =>
            !isPending && toggleInterviewLikeMutation(isTotalLikedIncludesMine)
          }
          prefixIcon={
            isTotalLikedIncludesMine ? (
              <HeartFilledIcon className="text-primary" />
            ) : (
              <HeartIcon />
            )
          }
        >
          {totalLikedCount}
        </Button>
      </div>
      <p className="text-lg whitespace-pre-wrap text-text-secondary">
        {result.totalFeedback}
      </p>
    </section>
  );
}
