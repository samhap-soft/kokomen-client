import {
  createRootRouteWithContext,
  Outlet,
  useCanGoBack,
  useRouter
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Button } from "@kokomen/ui/components/button";
import { ChevronLeft } from "lucide-react";
import { Toaster } from "@kokomen/ui/components/toast/toaster";
import React from "react";
import ErrorComponent from "@/common/components/ErrorComponent";
import { RouterContext } from "@/main";

// eslint-disable-next-line @rushstack/typedef-var
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: () => {
    return (
      <div className="h-screen">
        <ErrorComponent />
      </div>
    );
  }
});

function RootComponent(): React.ReactNode {
  const canGoBack = useCanGoBack();
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen">
      <header className="p-2 flex gap-2 flex-shrink-0">
        {canGoBack && (
          <Button
            variant={"text"}
            onClick={() => router.history.back()}
            className="[&_svg]:size-6"
          >
            <ChevronLeft />
          </Button>
        )}
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
