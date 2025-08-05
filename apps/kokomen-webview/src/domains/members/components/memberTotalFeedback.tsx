import { toggleMemberInterviewLike } from "@/domains/members/api";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Eye, Heart, MessageCircle, Trophy } from "lucide-react";
import { JSX, useState } from "react";
import { useToast } from "@kokomen/ui";
import { isAxiosError } from "axios";
import { Button } from "@kokomen/ui";
import { MemberInterviewResult } from "@kokomen/types";
import { CamelCasedProperties } from "@kokomen/utils/general/convertConvention";
// import { captureButtonEvent } from "@kokomen/utils/general/analytics";
import { useRouter } from "@tanstack/react-router";

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
      // captureButtonEvent({
      //   name: "MemberInterviewLike",
      //   properties: {
      //     type: "interview",
      //     likedInterviewId: interviewId,
      //     liked: !isTotalLikedIncludesMine,
      //   },
      // });
      setIsTotalLikedIncludesMine(!isTotalLikedIncludesMine);
      setTotalLikedCount(
        isTotalLikedIncludesMine ? totalLikedCount - 1 : totalLikedCount + 1
      );
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.navigate({
            to: "/login",
            params: {
              redirectTo: router.history.location.pathname
            }
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
      setIsTotalLikedIncludesMine(!isTotalLikedIncludesMine);
      setTotalLikedCount(
        isTotalLikedIncludesMine ? totalLikedCount + 1 : totalLikedCount - 1
      );
    }
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* 총점 */}
        <div className="text-center p-3 bg-fill-tertiary rounded-lg">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-text-light-solid" />
          </div>
          <p className="text-lg sm:text-xl font-semibold text-text-primary">
            {result.totalScore}
          </p>
          <p className="text-xs text-text-description">총점</p>
        </div>

        {/* 질문 수 */}
        <div className="text-center p-3 bg-fill-tertiary rounded-lg">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success rounded-lg flex items-center justify-center mx-auto mb-2">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-text-light-solid" />
          </div>
          <p className="text-lg sm:text-xl font-semibold text-text-primary">
            {result.feedbacks.length}
          </p>
          <p className="text-xs text-text-description">질문 수</p>
        </div>

        {/* 전체 좋아요 수 */}
        <div className="text-center p-3 bg-fill-tertiary rounded-lg">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-error rounded-lg flex items-center justify-center mx-auto mb-2">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-text-light-solid" />
          </div>
          <p className="text-lg sm:text-xl font-semibold text-text-primary">
            {totalLikedCount}
          </p>
          <p className="text-xs text-text-description">좋아요</p>
        </div>

        <div className="text-center p-3 bg-fill-tertiary rounded-lg">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-6 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-text-light-solid" />
          </div>
          <p className="text-lg sm:text-xl font-semibold text-text-primary">
            {result.interviewViewCount}
          </p>
          <p className="text-xs text-text-description">조회수</p>
        </div>
      </div>

      <div className="bg-bg-elevated border border-border rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-text-light-solid" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">
                종합 평가
              </h2>
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
              className={`self-start sm:self-auto px-3 py-2 text-sm ${isTotalLikedIncludesMine ? "bg-error-bg text-error" : "bg-fill-secondary text-text-description"}`}
              aria-label="전체 인터뷰 좋아요"
            >
              <Heart
                className={`w-4 h-4 mr-1 ${isTotalLikedIncludesMine ? "fill-current" : ""}`}
              />
              <span className="font-medium">{totalLikedCount}</span>
            </Button>
          </div>
        </div>
        <div className="bg-fill-tertiary rounded-lg p-4">
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {result.totalFeedback}
          </p>
        </div>
      </div>
    </div>
  );
}
