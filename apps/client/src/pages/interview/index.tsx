import { Layout } from "@kokomen/ui/components/common/Layout";
import Robots from "@/domains/interview/components/robots";
import InterviewSpeechBubble from "@/domains/interview/components/interviewSpeechBubble";
import { InterviewProvider } from "@/domains/interview/components/interviewProvider";
import { InterviewAnswerInput } from "@/domains/interview/components/interviewInput";
import Image from "next/image";
import { useRouter } from "next/router";
import InterviewModals from "@/domains/interview/components/interviewModals";
import Head from "next/head";

export default function Interview() {
  const router = useRouter();
  const { interview_id, question_id, root_question } = router.query;
  return (
    <>
      <Head>
        <title>꼬꼬면 면접</title>
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
      <Layout className="relative p-8">
        <Image
          src="/interview/background.png"
          alt="Background"
          width={1280}
          height={720}
          className="absolute w-full h-[60%] object-cover z-0 top-0 left-0"
        />
        <InterviewProvider
          interviewId={interview_id as unknown as number}
          questionId={question_id as unknown as number}
          rootQuestion={root_question as string}
        >
          <InterviewSpeechBubble />
          <Robots />
          <InterviewAnswerInput />
          <InterviewModals />
        </InterviewProvider>
      </Layout>
    </>
  );
}
