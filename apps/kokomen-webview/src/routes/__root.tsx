import {
  createRootRoute,
  Outlet,
  RootRoute,
  useCanGoBack,
  useRouter
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Button } from "@kokomen/ui/components/button";
import { ChevronLeft } from "lucide-react";
import { Toaster } from "@kokomen/ui/components/toast/toaster";

export const Route: RootRoute = createRootRoute({
  component: RootComponent,
  errorComponent: () => <div>Error</div>
});

function RootComponent() {
  const canGoBack = useCanGoBack();
  const router = useRouter();

  return (
    <>
      <header className="p-2 flex gap-2 bg-primary ">
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
        <main className="p-4">
          <Outlet />
        </main>
      </Toaster>
      <TanStackRouterDevtools />
    </>
  );
}
