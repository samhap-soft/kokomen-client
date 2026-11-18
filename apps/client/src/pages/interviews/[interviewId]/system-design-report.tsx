import { getUserInfo } from "@/domains/auth/api";
import { SystemDesignReportView } from "@/domains/systemDesign/components/systemDesignReport";
import { Footer } from "@/shared/footer";
import Header from "@/shared/header";
import { SEO } from "@/shared/seo";
import { parseNumericId } from "@/utils/routeParams";
import { UserInfo } from "@kokomen/types";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { JSX } from "react";

/**
 * 시스템 설계 면접 리포트.
 * 리포트 데이터는 브라우저에서 조회한다(백엔드 작업 전에는 MSW 목이 응답한다).
 */
export default function SystemDesignReportPage({
  interviewId,
  userInfo
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <>
      <SEO
        title="시스템 설계 면접 결과"
        description="시스템 설계 면접의 평가 포인트와 놓친 요구사항을 확인하세요."
        robots="noindex, nofollow, noarchive"
        pathname={`/interviews/${interviewId}/system-design-report`}
      />
      <div className="min-h-screen">
        <Header user={userInfo} />
        <main className="mx-auto w-full max-w-[1182px] px-5 pt-8 pb-[100px] xl:px-0">
          <SystemDesignReportView interviewId={interviewId} />
        </main>
        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  interviewId: number;
  userInfo: UserInfo | null;
}> = async (
  context
): Promise<
  GetServerSidePropsResult<{ interviewId: number; userInfo: UserInfo | null }>
> => {
  const interviewId = parseNumericId(context.params?.interviewId);
  if (interviewId === null) return { notFound: true };

  const userInfo = context.req.cookies.JSESSIONID
    ? await getUserInfo(context)
        .then((response) => response.data)
        .catch(() => null)
    : null;

  return { props: { interviewId, userInfo } };
};
