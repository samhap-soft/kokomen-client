import Header from "@/shared/header";
import { UserInfo } from "@kokomen/types";
import { JSX, ReactNode } from "react";
import AdminSidebar from "./adminSidebar";

interface AdminLayoutProps {
  user: UserInfo;
  children: ReactNode;
}

const AdminLayout = ({ user, children }: AdminLayoutProps): JSX.Element => {
  return (
    <main className="min-h-screen bg-bg-elevated">
      <Header user={user} />
      <div className="max-w-[1280px] mx-auto px-4 py-8 flex gap-8">
        <AdminSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </main>
  );
};

export default AdminLayout;
