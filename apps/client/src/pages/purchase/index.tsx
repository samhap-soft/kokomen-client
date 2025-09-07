import Header from "@/shared/header";
import PurchaseSection from "@/domains/purchase/components/PurchaseSection";
import PurchaseHistorySection from "@/domains/purchase/components/purchaseHistorySection";
import Link from "next/link";
import { getUserInfo } from "@/domains/auth/api";
import { Footer } from "@/shared/footer";
import { withCheckInServer } from "@/utils/auth";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getProducts } from "@/domains/purchase/api";
import { useSearchParams } from "next/navigation";
import { JSX } from "react";
import { motion } from "motion/react";

const sections = [
  {
    label: "토큰 구매",
    param: "purchase"
  },
  {
    label: "구매 내역",
    param: "history"
  }
] as const;

type SectionType = (typeof sections)[number]["param"];

export default function PurchasePage({
  userInfo,
  products
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const searchParams = useSearchParams();
  const currentSection =
    (searchParams.get("section") as SectionType) || "purchase";

  const renderSection = (): JSX.Element | null => {
    switch (currentSection) {
      case "purchase":
        return <PurchaseSection userInfo={userInfo} products={products} />;
      case "history":
        return <PurchaseHistorySection />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen">
      <Header user={userInfo} />
      <div className="container mx-auto px-6 pt-6">
        <div className="relative flex gap-4 border-b border-border mb-6">
          {sections.map((section) => (
            <Link
              key={section.param}
              href={`/purchase?section=${section.param}`}
              className={`relative pb-2 px-4 transition-colors ${
                currentSection === section.param
                  ? "text-primary font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {section.label}
              {currentSection === section.param && (
                <motion.div
                  layoutId="underline"
                  className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-primary"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
            </Link>
          ))}
        </div>
      </div>
      {renderSection()}
      <Footer />
    </main>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  return withCheckInServer(async () => {
    const data = await Promise.all([getUserInfo(context), getProducts()]);
    const userInfo = data[0].data;
    const products = data[1];
    return {
      data: {
        userInfo,
        products
      }
    };
  });
};
