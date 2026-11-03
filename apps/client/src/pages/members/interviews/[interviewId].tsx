import { getUserInfo } from "@/domains/auth/api";
import { getMemberInterviewResult } from "@/domains/members/api";
import { MemberInterviewResult } from "@kokomen/types";
import Header from "@/shared/header";
import { Footer } from "@/shared/footer";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { Button, ShareIcon } from "@kokomen/ui";
import { JSX } from "react";
import MemberTotalFeedback from "@/domains/members/components/memberTotalFeedback";
import MemberQuestionFeedback from "@/domains/members/components/memberQuestionFeedback";
import { CamelCasedProperties } from "@/utils/convertConvention";
import { SEO } from "@/shared/seo";
import { UserInfo } from "@kokomen/types";
import { parseNumericId } from "@/utils/routeParams";

const COMMUNITY_NOTICES: readonly string[] = [
  "AI 분석 결과는 면접 연습을 위한 참고 자료입니다.",
  "유용한 답변에는 좋아요를 남겨보세요.",
  "개인정보를 포함하지 않도록 확인해 주세요."
];

export default function MemberInterviewResultPage({
  result,
  user,
  interviewId
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const nickname: string = result.intervieweeNickname ?? "탈퇴한 사용자";
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "면접 결과 공유",
          text: `${nickname}님은 ${result.feedbacks[0].question}에 대해 무슨 질문을 받았을까요? 면접 결과를 확인해보고 공부해보세요!`,
          url: window.location.href
        });
      } catch (err) {
        console.error("공유 실패:", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <SEO
        title={`${nickname}님의 면접 결과`}
        description={`${nickname}님은 ${result.feedbacks[0].question}에 대해 무슨 질문을 받았을까요? 면접 결과를 확인해보고 공부해보세요!`}
        robots="index, follow"
        pathname={`/members/interviews/${interviewId}`}
        image="/interviewResult.png"
      />
      <main className="min-h-screen">
        <Header user={user} />
        <div className="mx-auto flex w-full max-w-[1182px] flex-col gap-[50px] px-5 pt-8 pb-[100px] xl:px-0">
          {/* 페이지 제목 */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <h1 className="text-3xl font-bold text-text-primary">
                {nickname}님의 면접 결과
              </h1>
              <p className="text-lg text-text-secondary">
                공개된 답변과 AI 피드백을 함께 살펴보세요.
              </p>
            </div>
            <Button
              variant="secondary"
              className="p-3"
              onClick={handleShare}
              aria-label="공유하기"
            >
              <ShareIcon />
            </Button>
          </div>

          <MemberTotalFeedback result={result} interviewId={interviewId} />

          {/* 질문별 상세 분석 */}
          <section className="flex flex-col gap-8">
            <h2 className="text-2xl font-bold text-text-primary">
              질문별 상세 분석
            </h2>
            <div className="flex flex-col gap-6">
              {result.feedbacks.map((feedback, index) => (
                <MemberQuestionFeedback
                  key={feedback.answerId}
                  questionAndFeedback={feedback}
                  index={index}
                  parseCode={result.includeLiveCoding}
                />
              ))}
            </div>
          </section>

          {/* 커뮤니티 공유 안내 */}
          <section className="flex flex-col gap-3 px-1">
            <h2 className="text-base font-semibold text-text-primary">
              커뮤니티 공유 안내
            </h2>
            <ul className="flex flex-col gap-1 text-base text-text-secondary">
              {COMMUNITY_NOTICES.map((notice) => (
                <li key={notice} className="flex items-center gap-1">
                  <span
                    aria-hidden
                    className="size-1 shrink-0 rounded-full bg-text-secondary"
                  />
                  {notice}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <Footer />
      </main>
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
    user: UserInfo | null;
    interviewId: number;
  }>
> => {
  // 숫자가 아닌 interviewId(스캐너 퍼징 등)가 그대로 API 요청에 실리지 않도록 먼저 걸러낸다.
  const interviewIdNumber = parseNumericId(context.params?.interviewId);

  if (interviewIdNumber === null) {
    return { notFound: true };
  }

  const [userResult, interviewResult] = await Promise.allSettled([
    getUserInfo(context),
    getMemberInterviewResult(interviewIdNumber, context)
  ]);

  if (interviewResult.status === "rejected") {
    // 크롤러가 인덱싱할 수 있도록 redirect 대신 notFound 반환
    // API가 인증 없이 접근 가능하도록 서버 측 수정이 필요할 수 있음
    return { notFound: true };
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
