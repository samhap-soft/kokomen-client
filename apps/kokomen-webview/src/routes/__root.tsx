import {
  createRootRouteWithContext,
  Outlet,
  useCanGoBack,
  useRouter
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Button, Toaster } from "@kokomen/ui";
import { ChevronLeft } from "lucide-react";
import React from "react";
import ErrorComponent from "@/common/components/ErrorComponent";
import { RouterContext } from "@/main";
import { FileRouteTypes } from "@/routeTree.gen";

// eslint-disable-next-line @rushstack/typedef-var
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: ErrorComponent
});

const headerTitle: Record<FileRouteTypes["fullPaths"], string> = {
  "/": "꼬꼬면",
  "/login/callback": "로그인",
  "/login/profile": "닉네임 설정",
  "/members/$memberId": "회원 인터뷰 기록보기",
  "/dashboard": "대시보드",
  "/interviews": "인터뷰",
  "/login": "로그인",
  "/interviews/$interviewId/result": "인터뷰 결과",
  "/members/interviews/$interviewId": "인터뷰 보기",
  "/interviews/$interviewId": "인터뷰 진행중"
};

function getRouteKey(pathname: string): keyof typeof headerTitle {
  if (/^\/members\/[^/]+$/.test(pathname)) return "/members/$memberId";
  if (/^\/interviews\/[^/]+$/.test(pathname)) return "/interviews/$interviewId";
  if (/^\/interviews\/[^/]+\/result$/.test(pathname))
    return "/interviews/$interviewId/result";
  if (/^\/members\/interviews\/[^/]+$/.test(pathname))
    return "/members/interviews/$interviewId";
  return pathname as keyof typeof headerTitle;
}

function RootComponent(): React.ReactNode {
  const canGoBack = useCanGoBack();
  const router = useRouter();
  const handleGoBack = () => {
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({
        type: "pageChange"
      })
    );
    router.history.back();
  };
  return (
    <div className="flex flex-col h-screen">
      <header className="p-2 flex gap-2 flex-shrink-0 items-center">
        {canGoBack && (
          <Button
            variant={"text"}
            onClick={handleGoBack}
            className="[&_svg]:size-6"
          >
            <ChevronLeft />
          </Button>
        )}
        <h1 className="ml-2 text-xl font-bold">
          {headerTitle[getRouteKey(router.state.location.pathname)]}
        </h1>
      </header>
      <Toaster>
        <main className="flex-1 overflow-auto relative">
          <Outlet />
        </main>
      </Toaster>
      <TanStackRouterDevtools />
    </div>
  );
}
