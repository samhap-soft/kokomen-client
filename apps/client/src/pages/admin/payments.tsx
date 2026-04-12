import { getUserInfo } from "@/domains/auth/api";
import AdminLayout from "@/domains/admin/components/adminLayout";
import AdminPaymentHistorySection from "@/domains/admin/components/paymentHistory/adminPaymentHistorySection";
import { withCheckInServer } from "@/utils/auth";
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
  return withCheckInServer(
    async () => {
      const userInfo = await getUserInfo(context);
      return {
        data: {
          userInfo: userInfo.data
        }
      };
    },
    { context, redirectPathWhenUnauthorized: "/admin/payments" }
  );
};
