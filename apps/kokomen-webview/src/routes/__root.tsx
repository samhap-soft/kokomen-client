import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <div className="p-2 flex gap-2"></div>
        <hr />
        <Outlet />
        <TanStackRouterDevtools />
      </>
    );
  }
});
