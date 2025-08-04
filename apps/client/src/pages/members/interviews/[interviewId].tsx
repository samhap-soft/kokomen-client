import { getUserInfo } from "@/domains/auth/api";
import { User } from "@/domains/auth/types";
import { getMemberInterviewResult } from "@/domains/members/api";
import { MemberInterviewResult } from "@/domains/members/types";
import Header from "@/shared/header";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { Layout, Button } from "@kokomen/ui";
import { JSX } from "react";
import { HelpCircle, Info, Users, Share2, Eye } from "lucide-react";
import MemberTotalFeedback from "@/domains/members/components/memberTotalFeedback";
import MemberQuestionFeedback from "@/domains/members/components/memberQuestionFeedback";
import { CamelCasedProperties } from "@/utils/convertConvention";
import { SEO } from "@/shared/seo";

export default function MemberInterviewResultPage({
  result,
  user,
  interviewId
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "면접 결과 공유",
          text: `${result.intervieweeNickname}님은 ${result.feedbacks[0].question}에 대해 무슨 질문을 받았을까요? 면접 결과를 확인해보고 공부해보세요!`,
          url: window.location.href
        });
      } catch (err) {
        console.log("공유 실패:", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <SEO
        title={`${result.intervieweeNickname}님의 면접 결과`}
        description={`${result.intervieweeNickname}님은 ${result.feedbacks[0].question}에 대해 무슨 질문을 받았을까요? 면접 결과를 확인해보고 공부해보세요!`}
        robots="index, follow"
        pathname={`/members/interviews/${interviewId}`}
        image="/og-report.png"
      />
      <Layout>
        <Header user={user} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* 커뮤니티 스타일 헤더 */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-6 to-blue-7 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        {result.intervieweeNickname}님의 면접 결과
                      </h1>
                      <p className="text-blue-1 text-sm">
                        {/* 멤버 이름 들어갈 곳 */}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="glass"
                      round
                      onClick={handleShare}
                      aria-label="공유하기"
                    >
                      <Share2 className="w-4 h-4 text-white mr-2" />
                      <span className="text-sm font-medium text-white">
                        공유하기
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* 점수 및 통계 섹션 */}

              {/* 전체 피드백 카드 */}
              <MemberTotalFeedback result={result} interviewId={interviewId} />
            </div>

            {/* 질문별 피드백 섹션 */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-5 to-blue-6 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    질문별 상세 분석
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>커뮤니티 공개</span>
                </div>
              </div>

              {result.feedbacks.map((feedback, index) => (
                <MemberQuestionFeedback
                  key={feedback.answerId}
                  questionAndFeedback={feedback}
                  index={index}
                />
              ))}
            </div>

            {/* 커뮤니티 안내 메시지 */}
            <div className="mt-12">
              <div className="bg-gradient-to-r from-geek-blue-1 to-geek-blue-2 rounded-2xl p-6 border border-geek-blue-3">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-geek-blue-5 to-geek-blue-6 rounded-full flex items-center justify-center">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-geek-blue-8">
                    커뮤니티 공유 안내
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-geek-blue-7">
                  <p>
                    • 이 결과는 AI가 분석한 내용이며, 학습 목적으로 커뮤니티에
                    공유됩니다.
                  </p>
                  <p>• 좋아요를 눌러 유용한 답변에 반응을 남겨보세요.</p>
                  <p>
                    • 개인정보는 포함되지 않으며, 면접 연습 개선을 위한 참고
                    자료로 활용됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{
    interviewId: string;
  }>
): Promise<
  GetServerSidePropsResult<{
    result: CamelCasedProperties<MemberInterviewResult>;
    user: User | null;
    interviewId: number;
  }>
> => {
  const { interviewId } = context.params as {
    interviewId: string;
  };

  if (!interviewId || isNaN(Number(interviewId))) {
    return { notFound: true };
  }

  const interviewIdNumber = Number(interviewId);
  const [userResult, interviewResult] = await Promise.allSettled([
    getUserInfo(context),
    getMemberInterviewResult(interviewIdNumber, context)
  ]);

  if (interviewResult.status === "rejected") {
    return { redirect: { destination: "/error", permanent: false } };
  }

  const result = interviewResult.value;
  const user = userResult.status === "fulfilled" ? userResult.value.data : null;

  return {
    props: {
      result,
      user,
      interviewId: interviewIdNumber
    }
  };
};
