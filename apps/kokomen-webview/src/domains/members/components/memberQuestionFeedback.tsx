import { useMutation } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@kokomen/ui/hooks/useToast";
import { isAxiosError } from "axios";
import { Button } from "@kokomen/ui/components/button";
import { toggleMemberInterviewAnswerLike } from "@/domains/members/api";
import { CamelCasedProperties } from "@kokomen/utils/general/convertConvention";
import { MemberInterviewResult } from "@kokomen/types/members";
import { useRouter } from "@tanstack/react-router";

// import { captureButtonEvent } from "@/utils/analytics";

export default function MemberQuestionFeedback({
  questionAndFeedback,
  index
}: {
  questionAndFeedback: CamelCasedProperties<
    MemberInterviewResult["feedbacks"][number]
  >;
  index: number;
}) {
  const [answerLiked, setAnswerLiked] = useState<boolean>(
    questionAndFeedback.answerAlreadyLiked
  );
  const router = useRouter();
  const { error: errorToast } = useToast();
  const { mutate: toggleInterviewLikeMutation, isPending } = useMutation({
    mutationFn: (liked: boolean) =>
      toggleMemberInterviewAnswerLike(liked, questionAndFeedback.answerId),
    onMutate: () => {
      // captureButtonEvent({
      //   name: "MemberInterviewLike",
      //   properties: {
      //     type: "answer",
      //     likedAnswerId: questionAndFeedback.answerId,
      //     liked: data,
      //   },
      // });
      setAnswerLiked(!answerLiked);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.navigate({
            to: `/login`,
            search: { redirect: router.state.location.pathname }
          });
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

  const badgeColor = useMemo(() => {
    switch (questionAndFeedback.answerRank.toLowerCase()) {
      case "A":
        return "bg-purple-1/80 text-purple-9 border-purple-3/60 backdrop-blur-sm";
      case "B":
        return "bg-blue-1/80 text-blue-9 border-blue-3/60 backdrop-blur-sm";
      case "C":
        return "bg-yellow-1/80 text-yellow-9 border-yellow-3/60 backdrop-blur-sm";
      case "D":
        return "bg-red-1/80 text-red-9 border-red-3/60 backdrop-blur-sm";
      default:
        return "bg-gray-1/80 text-gray-9 border-gray-3/60 backdrop-blur-sm";
    }
  }, [questionAndFeedback.answerRank]);

  return (
    <div
      key={questionAndFeedback.answerId}
      className="bg-bg-elevated/80 backdrop-blur-xl rounded-3xl shadow-box-shadow overflow-hidden border border-border/30 hover:shadow-box-shadow-secondary hover:border-border/50 transition-all duration-500 ease-out"
    >
      {/* 질문 헤더 */}
      <div className="bg-primary-bg backdrop-blur-md p-8 border-b border-border/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <span className="bg-gradient-to-r from-primary/30 to-primary-hover/30 backdrop-blur-sm text-text-light-solid px-4 py-2 rounded-2xl text-sm font-semibold border border-primary-border/40 shadow-lg">
                Q{index + 1}
              </span>
              <span
                className={`px-4 py-2 rounded-2xl text-sm font-semibold border backdrop-blur-sm shadow-lg ${badgeColor}`}
              >
                {questionAndFeedback.answerRank}
              </span>
            </div>
            <h3 className="text-xl font-bold text-text-heading mb-3 leading-relaxed">
              {questionAndFeedback.question}
            </h3>
          </div>
          <Button
            aria-busy={isPending}
            disabled={isPending}
            onClick={() => toggleInterviewLikeMutation(answerLiked)}
            type="button"
            name={`answer-like-button-${questionAndFeedback.answerId}`}
            role="button"
            variant="glass"
            optimistic={true}
            className={`${answerLiked && "bg-warning-bg/60 text-warning-text border-warning-border/50"} backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300`}
            aria-label={`답변 ${index + 1} 좋아요`}
          >
            <Heart
              className={`w-5 h-5 mr-2 ${answerLiked ? "fill-current" : ""}`}
            />
            <span className="text-sm font-semibold">
              {answerLiked
                ? questionAndFeedback.answerLikeCount + 1
                : questionAndFeedback.answerLikeCount}
            </span>
          </Button>
        </div>
      </div>

      {/* 답변 및 피드백 내용 */}
      <div className="p-8 space-y-8">
        {/* 답변 섹션 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-primary-hover rounded-full shadow-lg"></div>
            <h4 className="text-base font-bold text-text-heading">응답 내용</h4>
          </div>
          <div className="bg-primary-bg backdrop-blur-md rounded-2xl p-6 border border-primary-border/30 shadow-lg">
            <p className="text-text-primary leading-relaxed whitespace-pre-wrap text-base">
              {questionAndFeedback.answer}
            </p>
          </div>
        </div>

        {/* AI 피드백 섹션 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-purple-6 rounded-full shadow-lg"></div>
            <h4 className="text-base font-bold text-text-heading">AI 피드백</h4>
          </div>
          <div className="bg-purple-2 backdrop-blur-md rounded-2xl p-6 border border-purple-3/30 shadow-lg">
            <p className="text-text-primary leading-relaxed whitespace-pre-wrap text-base">
              {questionAndFeedback.answerFeedback}
            </p>
          </div>
        </div>

        {/* 사용자 메모 섹션 */}
        {questionAndFeedback.submittedAnswerMemoContent && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gradient-to-r from-success to-success-hover rounded-full shadow-lg"></div>
              <h4 className="text-base font-bold text-text-heading">
                사용자 메모
              </h4>
            </div>
            <div className="bg-gradient-to-r from-success-bg/40 to-success-bg-hover/40 backdrop-blur-md rounded-2xl p-6 border border-success-border/30 shadow-lg">
              <p className="text-text-primary leading-relaxed whitespace-pre-wrap text-base">
                {questionAndFeedback.submittedAnswerMemoContent}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
