import { toggleMemberInterviewLike } from "@/domains/members/api";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Heart, MessageCircle, Trophy } from "lucide-react";
import { JSX, useState } from "react";
import { useToast } from "@kokomen/ui/hooks/useToast";
import { isAxiosError } from "axios";
import { Button } from "@kokomen/ui/components/button";
import { MemberInterviewResult } from "@/domains/members/types";
import { CamelCasedProperties } from "@/utils/convertConvention";
import { captureButtonEvent } from "@/utils/analytics";

export default function MemberTotalFeedback({
  result,
  interviewId,
}: {
  result: CamelCasedProperties<MemberInterviewResult>;
  interviewId: number;
}): JSX.Element {
  const [isTotalLikedIncludesMine, setIsTotalLikedIncludesMine] =
    useState<boolean>(result.interviewAlreadyLiked);
  const [totalLikedCount, setTotalLikedCount] = useState<number>(
    result.interviewLikeCount
  );
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
          liked: !isTotalLikedIncludesMine,
        },
      });
      setIsTotalLikedIncludesMine(!isTotalLikedIncludesMine);
      setTotalLikedCount(
        isTotalLikedIncludesMine ? totalLikedCount - 1 : totalLikedCount + 1
      );
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
        setIsTotalLikedIncludesMine(!isTotalLikedIncludesMine);
        setTotalLikedCount(
          isTotalLikedIncludesMine ? totalLikedCount + 1 : totalLikedCount - 1
        );
      }
    },
  });

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 총점 */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {result.totalScore}
          </p>
          <p className="text-sm text-gray-600">총점</p>
        </div>

        {/* 질문 수 */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {result.feedbacks.length}
          </p>
          <p className="text-sm text-gray-600">질문 수</p>
        </div>

        {/* 전체 좋아요 수 */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalLikedCount}</p>
          <p className="text-sm text-gray-600">좋아요</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-1 to-blue-2 rounded-2xl p-6 border border-blue-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-5 to-blue-6 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">종합 평가</h2>
          </div>
          <Button
            optimistic
            disabled={isPending}
            aria-busy={isPending}
            onClick={() =>
              toggleInterviewLikeMutation(isTotalLikedIncludesMine)
            }
            name={`interview-like-button-${interviewId}`}
            role="button"
            type="button"
            variant="glass"
            className={`${isTotalLikedIncludesMine && "bg-volcano-3 text-volcano-6 hover:bg-volcano-4"}`}
            aria-label="전체 인터뷰 좋아요"
          >
            <Heart
              className={`w-5 h-5 mr-2 ${isTotalLikedIncludesMine ? "fill-current" : ""}`}
            />
            <span className="text-sm font-medium">{totalLikedCount}</span>
          </Button>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-white/50">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {result.totalFeedback}
          </p>
        </div>
      </div>
    </div>
  );
}
