import { getCategories } from "@/api/category";
import { GetServerSidePropsResult, InferGetServerSidePropsType } from "next";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { Roboto } from "next/font/google";
import { useRouter } from "next/router";
import { JSX, useState, useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Header from "@/shared/header";
import {
  NewInterviewRequest,
  startNewInterview,
} from "@/domains/interview/api";
import { Button } from "@kokomen/ui/components/button";

const roboto: NextFontWithVariable = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
});

const CATEGORY_META = {
  ALGORITHM: {
    title: "알고리즘(Algorithm)",
    description:
      "알고리즘(Algorithm)은 특정 문제를 해결하기 위한 단계적 절차 또는 공식을 의미합니다.",
    image: "/linux.png",
    alt: "Algorithm",
  },
  DATA_STRUCTURE: {
    title: "자료구조(Data Structures)",
    description:
      "자료구조(Data Structures)는 데이터를 저장하고 관리하는 방식으로, 효율적인 데이터 처리를 위해 다양한 형태로 구성됩니다.",
    image: "/linux.png",
    alt: "Data Structures",
  },
  NETWORK: {
    title: "네트워크(Network)",
    description:
      "네트워크(Network)는 컴퓨터와 장치들이 서로 연결되어 데이터를 주고받을 수 있도록 하는 시스템입니다.",
    image: "/linux.png",
    alt: "Network",
  },
  OPERATING_SYSTEM: {
    title: "운영체제(Operating Systems)",
    description:
      "운영체제(Operating System, OS)는 컴퓨터의 하드웨어 자원을 관리하고, 사용자 및 응용 프로그램이 컴퓨터와 상호작용할 수 있도록 지원하는 소프트웨어의 집합이라고 정의할 수 있습니다.",
    image: "/linux.png",
    alt: "Operating System",
  },
  DATABASE: {
    title: "데이터베이스(Database)",
    description:
      "데이터베이스는 구조화된 정보의 체계적인 수집으로, 일반적으로 컴퓨터 시스템에 전자적으로 저장됩니다.",
    image: "/linux.png",
    alt: "Database",
  },
} as const;

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20] as const;

export default function Home({
  categories,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const router = useRouter();
  const [interviewConfig, setInterviewConfig] = useState<NewInterviewRequest>({
    category: categories[0] || "",
    max_question_count: QUESTION_COUNT_OPTIONS[0],
  });

  const createInterviewMutation = useMutation({
    mutationFn: startNewInterview,
    onSuccess: (data) => {
      router.push({
        pathname: `/interviews/${data.interview_id}`,
        query: {
          questionId: data.question_id,

          root_question: data.root_question,
        },
      });
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.replace("/login");
        }
      }
    },
    onSettled: () => {
      console.log("Interview creation attempt completed");
    },
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        if (
          error.response?.status &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          return false;
        }

        return failureCount < 2;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const selectedCategoryMeta = useMemo(() => {
    return (
      CATEGORY_META[interviewConfig.category as keyof typeof CATEGORY_META] || {
        title: interviewConfig.category,
        description: `${CATEGORY_META[interviewConfig.category as keyof typeof CATEGORY_META]?.description || `${interviewConfig.category}에 대한 면접을 시작해보세요.`}`,
        image: "/linux.png",
        alt: interviewConfig.category,
      }
    );
  }, [interviewConfig.category]);

  const handleCategoryChange = useCallback((category: string) => {
    setInterviewConfig((prev) => ({ ...prev, category }));
  }, []);

  const handleQuestionCountChange = useCallback((event: "plus" | "minus") => {
    setInterviewConfig((prev) => ({
      ...prev,
      max_question_count:
        event === "plus"
          ? Math.min(20, prev.max_question_count + 1)
          : Math.max(3, prev.max_question_count - 1),
    }));
  }, []);

  const handleNewInterview = useCallback(() => {
    createInterviewMutation.mutate(interviewConfig);
  }, [interviewConfig, createInterviewMutation]);

  return (
    <>
      <Head>
        <title>꼬꼬면 - 면접 연습 플랫폼</title>
        <meta
          name="description"
          content="운영체제, 데이터베이스, 자료구조, 알고리즘 면접 연습"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${roboto.className} min-h-[720px] min-w-[1280px] w-screen h-screen`}
      >
        <Header />
        <main className="w-full flex h-full">
          <section className="px-8 py-4 w-full">
            {/* 카테고리 탭 */}
            <nav className="w-full font-bold overflow-x-auto">
              <ol className="flex">
                {categories.map((category) => (
                  <li key={category}>
                    <Button
                      variant={"default"}
                      role="tab"
                      aria-selected={interviewConfig.category === category}
                      className={`p-3 hover:bg-gray-100 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset outline-none rounded-none ${
                        interviewConfig.category === category
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-700"
                      }`}
                      onClick={() => handleCategoryChange(category)}
                      disabled={createInterviewMutation.isPending}
                    >
                      {category}
                    </Button>
                  </li>
                ))}
              </ol>
            </nav>

            {/* 메인 컨텐츠 */}
            <div className="w-full flex flex-col items-center px-8 pt-8">
              <Image
                src={selectedCategoryMeta.image}
                alt={selectedCategoryMeta.alt}
                width={250}
                height={250}
                priority
              />
              <h1 className="text-4xl font-bold p-2">
                {selectedCategoryMeta.title}
              </h1>
              <p className="py-4 text-lg text-center max-w-4xl leading-relaxed">
                {selectedCategoryMeta.description}
              </p>

              {/* 문제 개수 선택 */}
              <div className="w-full flex justify-center flex-col items-center gap-5 my-7">
                <label
                  htmlFor="question-count"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  면접 문제 개수 선택
                </label>
                <div className="flex items-center justify-center gap-5">
                  <Button
                    round
                    variant={"primary"}
                    size={"default"}
                    className="text-2xl w-10 h-10"
                    onClick={() => handleQuestionCountChange("minus")}
                  >
                    -
                  </Button>
                  <div className="flex items-center justify-center mx-2 border w-28 h-28 text-4xl rounded-full border-border">
                    {interviewConfig.max_question_count}
                  </div>
                  <Button
                    round
                    variant={"primary"}
                    size={"default"}
                    className="text-2xl w-10 h-10"
                    onClick={() => handleQuestionCountChange("plus")}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* 면접 시작 버튼 */}
              <Button
                variant={"primary"}
                size={"default"}
                onClick={handleNewInterview}
                disabled={createInterviewMutation.isPending}
                aria-describedby="interview-info"
              >
                {createInterviewMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    면접 시작 중...
                  </span>
                ) : (
                  `${interviewConfig.category} 면접 시작하기 (${interviewConfig.max_question_count}문제)`
                )}
              </Button>

              <p
                id="interview-info"
                className="mt-2 text-sm text-gray-600 text-center"
              >
                선택한 카테고리의 {interviewConfig.max_question_count}개 문제로
                면접을 진행합니다
              </p>
            </div>
          </section>

          <aside className="min-w-[380px] w-1/4 h-full border-l border-gray-200 py-8 bg-gray-50">
            <div className="flex flex-col items-center h-full">
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                MVP
              </div>
              <span className="mt-6 text-xl font-bold text-gray-800">MVP</span>

              <div className="w-full p-8 flex-1">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  최근에 본 면접
                </h2>
                <ul className="flex flex-col gap-3">
                  <li>
                    <Link
                      href="/interview/1"
                      className="block w-full p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-white transition-all text-center"
                    >
                      운영체제
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/interview/2"
                      className="block w-full p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-white transition-all text-center"
                    >
                      데이터베이스
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/interview/3"
                      className="block w-full p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-white transition-all text-center"
                    >
                      자료구조
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps = async (): Promise<
  GetServerSidePropsResult<{ categories: string[] }>
> => {
  try {
    const { categories } = await getCategories();
    return {
      props: {
        categories,
      },
    };
  } catch {
    return {
      redirect: {
        destination: "/500",
        permanent: false,
      },
    };
  }
};
