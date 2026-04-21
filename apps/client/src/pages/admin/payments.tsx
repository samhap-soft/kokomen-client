import AdminLayout from "@/domains/admin/components/adminLayout";
import AdminPaymentHistorySection from "@/domains/admin/components/paymentHistory/adminPaymentHistorySection";
import { withAdminCheck } from "@/utils/auth";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { JSX } from "react";
import { UserInfo } from "@kokomen/types";

export default function AdminPayments({
  userInfo
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <AdminLayout user={userInfo}>
      <AdminPaymentHistorySection />
    </AdminLayout>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ userInfo: UserInfo }>> => {
  return withAdminCheck(context, async (userInfo) => {
    return { data: { userInfo: userInfo as UserInfo } };
  });
};
