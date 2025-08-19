import { JSX } from "react";
import Header from "@/shared/header";
import { getUserInfo } from "@/domains/auth/api";
import { isAxiosError } from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { SEO } from "@/shared/seo";
import {
  HeroSection,
  MockInterviewSection,
  RankerReferenceSection,
  FeaturesSection,
  CTASection,
  Footer
} from "@/domains/onboard/components";

export default function Home({
  user
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <>
      <SEO />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Header user={user} />
        <HeroSection />
        <MockInterviewSection />
        <RankerReferenceSection />
        <FeaturesSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { data: user } = await getUserInfo(context);
    return {
      props: {
        user
      }
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      return {
        props: {
          user: null
        }
      };
    }
    return {
      redirect: {
        destination: "/error",
        permanent: false
      }
    };
  }
};
