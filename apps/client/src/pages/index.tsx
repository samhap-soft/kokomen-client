import { startNewInterview } from "@/domains/interview/api";
import { Roboto } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const roboto = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
});

export default function Home() {
  const navigate = useRouter();
  const [loading, setLoading] = useState(false);
  const handleNewInterview = async () => {
    try {
      setLoading(true);
      const { data } = await startNewInterview();
      navigate.push({
        pathname: "/interview",
        query: {
          interview_id: data.interview_id,
          question_id: data.question_id,
          root_question: data.root_question,
        },
      });
    } catch {
      console.error("Failed to start new interview");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Head>
        <title>꼬꼬면 - 면접 연습 플랫폼</title>
        <meta
          name="description"
          content="운영체제, 데이터베이스, 자료구조, 알고리즘 면접 연습"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta
          http-equiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />
      </Head>
      <div
        className={`${roboto.className} min-h-[720px] min-w-[1024px] w-screen h-screen`}
      >
        <header className="px-4 py-2 border-b border-gray-300 justify-between flex w-full items-center">
          <div className="flex items-center gap-2">
            <Image src={"/icon.png"} alt="logo" width={50} height={50} />
            <span className="text-xl font-bold">꼬꼬면</span>
          </div>
          <ol className="flex gap-2">
            <li>
              <Link href={"/"}>홈</Link>
            </li>
          </ol>
        </header>
        <main className="w-full flex h-full">
          <section className="px-8 py-4">
            <ol className="flex gap-6 font-bold">
              <li className="p-3 border-b-2">운영체제</li>
              <li className="p-3">데이터베이스</li>
              <li className="p-3">자료구조</li>
              <li className="p-3">알고리즘</li>
            </ol>
            <div className="w-full flex flex-col items-center px-8">
              <Image
                src="/linux.png"
                alt="Operating System"
                width={250}
                height={250}
              />
              <h1 className="text-4xl font-bold p-2">Operating Systems</h1>
              <p className="py-4 text-lg">
                운영체제(Operating System, OS)는 컴퓨터의 하드웨어 자원을
                관리하고, 사용자 및 응용 프로그램이 컴퓨터와 상호작용할 수
                있도록 지원하는 소프트웨어의 집합이라고 정의할 수 있습니다.
                기본적으로, 운영체제는 컴퓨터 시스템의 자원을 효율적으로
                관리하고, 사용자 및 다른 소프트웨어와의 상호작용을 가능하게
                하여, 사용자가 소프트웨어를 더 쉽게 사용할 수 있게 돕습니다.
                운영체제의 주요 목표는 시스템의 성능을 최적화하면서, 사용자에게
                편리한 인터페이스를 제공하는 것입니다.
              </p>
              <button
                className="mt-8 p-6 border border-gray-300 w-full cursor-pointer"
                onClick={handleNewInterview}
                disabled={loading}
              >
                {loading ? "면접 시작 중..." : "면접 시작하기"}
              </button>
            </div>
          </section>
          <aside className="min-w-[380px] w-1/4 h-full border border-gray-300 py-8 text-center center flex flex-col items-center">
            <p className="w-36 h-36 rounded-full bg-gray-400 self-center"></p>
            <span className="mt-10 text-xl font-bold">MVP</span>
            <div className="w-full p-8">
              <p className="p-4">최근에 본 면접</p>
              <ul className="flex flex-col items-center w-full gap-4">
                <li className="w-full p-2 border border-gray-300 rounded-xl">
                  <Link href={"/interview/1"}>운영체제</Link>
                </li>
                <li className="w-full p-2 border border-gray-300 rounded-xl">
                  <Link href={"/interview/2"}>데이터베이스</Link>
                </li>
                <li className="w-full p-2 border border-gray-300 rounded-xl">
                  <Link href={"/interview/3"}>자료구조</Link>
                </li>
              </ul>
            </div>
            <span></span>
          </aside>
        </main>
      </div>
    </>
  );
}
