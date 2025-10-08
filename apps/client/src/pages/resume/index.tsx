import Header from "@/shared/header";
import { getUserInfo } from "@/domains/auth/api";
import {
  ResumeSelectMenu3d,
  ResumeSelectMenuNormal
} from "@/domains/resume/components";
import { UserInfo } from "@kokomen/types";
import { ErrorBoundary } from "@sentry/nextjs";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { useSearchParams } from "next/navigation";
import { Footer } from "@/shared/footer";
import { AxiosError } from "axios";

export default function ResumePage({
  userInfo
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "3d";
  return (
    <main className="min-h-screen">
      <Header user={userInfo} />
      <div className="container mx-auto px-6 pt-6">
        <div className="relative flex gap-4 border-b border-border mb-6">
          {view === "3d" && (
            <ErrorBoundary>
              <ResumeSelectMenu3d />
            </ErrorBoundary>
          )}
          {view === "normal" && (
            <ErrorBoundary>
              <ResumeSelectMenuNormal />
            </ErrorBoundary>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ userInfo: UserInfo | null }>> => {
  const userInfo = await getUserInfo(context)
    .then((res) => res.data)
    .catch((error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return null;
      }
      throw error;
    });

  return {
    props: {
      userInfo
    }
  };
};
