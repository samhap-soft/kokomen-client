import { useMutation } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@kokomen/ui/hooks/useToast";
import { isAxiosError } from "axios";
import { Button } from "@kokomen/ui/components/button";
import { toggleMemberInterviewAnswerLike } from "@/domains/members/api";
import { CamelCasedProperties } from "@/utils/convertConvention";
import { MemberInterviewResult } from "@/domains/members/types";
import { captureButtonEvent } from "@/utils/analytics";

export default function MemberQuestionFeedback({
  questionAndFeedback,
  index,
}: {
  questionAndFeedback: CamelCasedProperties<
    MemberInterviewResult["feedbacks"][number]
  >;
  index: number;
}) {
  const [answerLiked, setAnswerLiked] = useState<boolean>(
    questionAndFeedback.answerAlreadyLiked
  );
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
          liked: data,
        },
      });
      setAnswerLiked(!answerLiked);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        errorToast({
          title: "좋아요 실패",
          description: error.response?.data.message,
        });
      } else {
        errorToast({
          title: "좋아요 실패",
          description: "서버 오류가 발생했습니다.",
        });
      }
      setAnswerLiked(!answerLiked);
    },
  });

  const badgeColor = useMemo(() => {
    switch (questionAndFeedback.answerRank.toLowerCase()) {
      case "A":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "B":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "C":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "D":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  }, [questionAndFeedback.answerRank]);

  return (
    <div
      key={questionAndFeedback.answerId}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
    >
      {/* 질문 헤더 */}
      <div className="bg-gradient-to-r from-blue-1 to-blue-2 p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className="bg-gradient-to-r from-blue-5 to-blue-6 text-white px-3 py-1 rounded-full text-sm font-medium">
                Q{index + 1}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${badgeColor}`}
              >
                {questionAndFeedback.answerRank}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
            className={`${answerLiked && "bg-volcano-3 text-volcano-6 hover:bg-volcano-4"}`}
            aria-label={`답변 ${index + 1} 좋아요`}
          >
            <Heart
              className={`w-4 h-4 mr-2 ${answerLiked ? "fill-current" : ""}`}
            />
            <span className="text-sm font-medium">
              {answerLiked
                ? questionAndFeedback.answerLikeCount + 1
                : questionAndFeedback.answerLikeCount}
            </span>
          </Button>
        </div>
      </div>

      {/* 답변 및 피드백 내용 */}
      <div className="p-6 space-y-6">
        {/* 답변 섹션 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-4 to-blue-5 rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-700">응답 내용</h4>
          </div>
          <div className="bg-gradient-to-r from-blue-1 to-blue-2 rounded-xl p-4 border border-blue-3">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {questionAndFeedback.answer}
            </p>
          </div>
        </div>

        {/* AI 피드백 섹션 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-cyan-4 to-cyan-5 rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-700">AI 피드백</h4>
          </div>
          <div className="bg-gradient-to-r from-cyan-1 to-cyan-2 rounded-xl p-4 border border-cyan-3">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {questionAndFeedback.answerFeedback}
            </p>
          </div>
        </div>

        {/* 사용자 메모 섹션 */}
        {questionAndFeedback.submittedAnswerMemoContent && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-4 to-green-5 rounded-full"></div>
              <h4 className="text-sm font-semibold text-gray-700">
                사용자 메모
              </h4>
            </div>
            <div className="bg-gradient-to-r from-green-1 to-green-2 rounded-xl p-4 border border-green-3">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {questionAndFeedback.submittedAnswerMemoContent}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
