import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { isAxiosError } from "axios";
import {
  AnswerContent,
  Badge,
  Button,
  HeartFilledIcon,
  HeartIcon,
  useToast
} from "@kokomen/ui";
import { getRankBadgeType } from "@/domains/interviewReport/components/rankLabel";
import { toggleMemberInterviewAnswerLike } from "@/domains/members/api";
import { CamelCasedProperties } from "@/utils/convertConvention";
import { MemberInterviewResult } from "@kokomen/types";
import { captureButtonEvent } from "@/utils/analytics";
import useExtendedRouter from "@/hooks/useExtendedRouter";

export default function MemberQuestionFeedback({
  questionAndFeedback,
  index,
  parseCode = false
}: {
  questionAndFeedback: CamelCasedProperties<
    MemberInterviewResult["feedbacks"][number]
  >;
  index: number;
  parseCode?: boolean;
}) {
  const [answerLiked, setAnswerLiked] = useState<boolean>(
    questionAndFeedback.answerAlreadyLiked
  );
  const router = useExtendedRouter();
  const { error: errorToast } = useToast();
  const { mutate: toggleInterviewLikeMutation, isPending } = useMutation({
    mutationFn: (liked: boolean) =>
      toggleMemberInterviewAnswerLike(liked, questionAndFeedback.answerId),
    onMutate: (data) => {
      captureButtonEvent({
        name: "MemberInterviewLike",
        properties: {
          type: "answer",
          likedAnswerId: questionAndFeedback.answerId,
          liked: data
        }
      });
      setAnswerLiked(!answerLiked);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.navigateToLogin();
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
      setAnswerLiked(!answerLiked);
    }
  });

  return (
    <article className="flex flex-col gap-4 border-b border-border py-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="flex flex-wrap items-center gap-1 text-lg font-semibold text-text-primary">
          <Badge
            appearance="weak"
            type={getRankBadgeType(questionAndFeedback.answerRank)}
          >
            {questionAndFeedback.answerRank}등급
          </Badge>
          {questionAndFeedback.question}
        </h3>
        <Button
          variant="secondary"
          type="button"
          name={`answer-like-button-${questionAndFeedback.answerId}`}
          aria-busy={isPending}
          aria-pressed={answerLiked}
          aria-label={`답변 ${index + 1} 좋아요`}
          onClick={() => !isPending && toggleInterviewLikeMutation(answerLiked)}
          prefixIcon={
            answerLiked ? (
              <HeartFilledIcon className="text-primary" />
            ) : (
              <HeartIcon />
            )
          }
        >
          {answerLiked
            ? questionAndFeedback.answerLikeCount + 1
            : questionAndFeedback.answerLikeCount}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-base font-semibold text-text-primary">응답 내용</h4>
        <AnswerContent
          content={questionAndFeedback.answer}
          className="text-lg text-text-secondary"
          parseCode={parseCode}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-fill-content p-5">
        <h4 className="text-base font-semibold text-text-primary">AI 피드백</h4>
        <p className="text-lg whitespace-pre-wrap text-text-secondary">
          {questionAndFeedback.answerFeedback}
        </p>
      </div>

      {/* Figma 에는 없지만 작성자가 공개한 메모가 있으면 AI 피드백과 같은 모양으로 보여준다 */}
      {questionAndFeedback.submittedAnswerMemoContent && (
        <div className="flex flex-col gap-3 rounded-xl bg-fill-content p-5">
          <h4 className="text-base font-semibold text-text-primary">
            사용자 메모
          </h4>
          <p className="text-lg whitespace-pre-wrap text-text-secondary">
            {questionAndFeedback.submittedAnswerMemoContent}
          </p>
        </div>
      )}
    </article>
  );
}
