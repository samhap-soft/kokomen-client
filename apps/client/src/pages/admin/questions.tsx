import { getUserInfo } from "@/domains/auth/api";
import AdminLayout from "@/domains/admin/components/adminLayout";
import { withCheckInServer } from "@/utils/auth";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { JSX } from "react";
import { UserInfo } from "@kokomen/types";

export default function AdminQuestions({
  userInfo
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <AdminLayout user={userInfo}>
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p className="text-lg font-medium">준비 중입니다</p>
        <p className="text-sm mt-2">루트질문 관리 기능은 현재 준비 중입니다.</p>
      </div>
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
    { context, redirectPathWhenUnauthorized: "/admin/questions" }
  );
};
