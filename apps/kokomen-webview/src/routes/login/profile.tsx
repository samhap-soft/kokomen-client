import ProfileSettingForm from "@/domains/auth/components/profilesettingForm";
import { useAuthStore } from "@/store";
import { createFileRoute, redirect, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/login/profile")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!useAuthStore.getState().isAuthenticated) {
      if (useAuthStore.getState().user?.profile_completed) {
        throw redirect({ to: "/interviews", replace: true });
      }
      throw redirect({ to: "/login", replace: true });
    }
  }
});

function RouteComponent() {
  const { redirectTo } = useSearch({
    from: "/login/profile",
    select: (search) => search as { redirectTo: string }
  });
  const userInfo = useAuthStore((state) => state.user);
  if (!userInfo) {
    throw redirect({ to: "/login", replace: true });
  }
  return (
    <main className="h-full bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              프로필 설정
            </h1>
            <p className="text-gray-600 text-sm">닉네임을 설정해주세요</p>
          </div>

          <ProfileSettingForm userInfo={userInfo} redirectTo={redirectTo} />
        </div>
      </div>
    </main>
  );
}
