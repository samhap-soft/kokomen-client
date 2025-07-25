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

export const Route: RootRoute = createRootRoute({
  component: RootComponent
});

function RootComponent() {
  const canGoBack = useCanGoBack();
  const router = useRouter();

  return (
    <>
      <div className="p-2 flex gap-2 bg-primary ">
        {!canGoBack && (
          <Button
            variant={"text"}
            onClick={() => router.history.back()}
            className="[&_svg]:size-6"
          >
            <ChevronLeft />
          </Button>
        )}
      </div>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
