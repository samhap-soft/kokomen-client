import { getCategories } from "@/api/category";
import { BasicInterviewRoom } from "@/domains/interview/components/room/basicInterviewRoom";
import { SEO } from "@/shared/seo";
import { InterviewMode } from "@kokomen/types";
import { LoadingFullScreen } from "@kokomen/ui";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import dynamic from "next/dynamic";
import { JSX } from "react";

// 다이어그램 에디터(React Flow)를 기본 면접에서는 내려받지 않도록 따로 나눈다
// eslint-disable-next-line @rushstack/typedef-var
const SystemDesignInterviewRoom = dynamic(
  () =>
    import("@/domains/systemDesign/components/systemDesignRoom").then(
      (module) => module.SystemDesignInterviewRoom
    ),
  {
    ssr: false,
    loading: () => <LoadingFullScreen className="h-screen w-screen" />
  }
);

type InterviewRoomType = "BASIC" | "CODE" | "SYSTEM_DESIGN";

type InterviewPageProps = {
  interviewId: number;
  mode: InterviewMode;
  roomType: InterviewRoomType;
  categoryTitle: string | null;
};

/**
 * 면접실. 유형(기본 · 라이브 코딩 · 시스템 설계)은 같은 라우트에서 `type` 쿼리로 나눈다.
 * 공통 화면(입장 화면 · 영상 타일 · 조작 바)은 InterviewRoomLayout 이 맡는다.
 */
export default function InterviewPage({
  interviewId,
  mode,
  roomType,
  categoryTitle
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <>
      <SEO
        title="모의 면접"
        description="운영체제, 데이터베이스, 자료구조, 알고리즘 면접 연습"
        robots="noindex, nofollow, noarchive"
        pathname={`/interviews/${interviewId}`}
      />
      {roomType === "SYSTEM_DESIGN" ? (
        <SystemDesignInterviewRoom interviewId={interviewId} />
      ) : (
        <BasicInterviewRoom
          interviewId={interviewId}
          mode={mode}
          isLiveCoding={roomType === "CODE"}
          categoryTitle={categoryTitle}
        />
      )}
    </>
  );
}

const pickFirst = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export const getServerSideProps: GetServerSideProps<InterviewPageProps> = async (
  context
): Promise<GetServerSidePropsResult<InterviewPageProps>> => {
  // 쿼리는 문자열 또는 문자열 배열로 올 수 있고, 값 자체를 신뢰할 수 없다.
  const rawInterviewId = pickFirst(context.query.interviewId);
  const rawMode = pickFirst(context.query.mode);
  const rawType = pickFirst(context.query.type);
  const rawCategory = pickFirst(context.query.category);

  const parsedInterviewId = Number(rawInterviewId);
  const isValidInterviewId =
    rawInterviewId !== undefined &&
    Number.isInteger(parsedInterviewId) &&
    parsedInterviewId > 0;
  const isValidMode = rawMode === "TEXT" || rawMode === "VOICE";

  if (!isValidInterviewId || !isValidMode) {
    return { notFound: true };
  }

  const roomType: InterviewRoomType =
    rawType === "CODE" || rawType === "SYSTEM_DESIGN" ? rawType : "BASIC";

  // 헤더의 "프론트엔드 모의면접" 같은 제목. 못 가져와도 면접은 진행한다
  const categoryTitle =
    roomType !== "SYSTEM_DESIGN" && rawCategory
      ? await getCategories(context)
          .then(
            (response) =>
              response.data.find((category) => category.key === rawCategory)
                ?.title ?? null
          )
          .catch(() => null)
      : null;

  return {
    props: {
      interviewId: parsedInterviewId,
      // 시스템 설계는 TEXT 전용이다
      mode: roomType === "SYSTEM_DESIGN" ? "TEXT" : (rawMode as InterviewMode),
      roomType,
      categoryTitle
    }
  };
};
