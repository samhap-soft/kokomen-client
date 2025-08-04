import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { LoadingFullScreen } from "@kokomen/ui";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import {
  QueryClient,
  QueryClientProvider,
  useQuery
} from "@tanstack/react-query";
import { meKeys } from "@kokomen/utils/general/querykeys";
import { getUserInfo } from "@/domains/auth/api";
import { useAuthStore } from "@/store";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

export interface RouterContext {
  queryClient: QueryClient;
}

// eslint-disable-next-line @rushstack/typedef-var
const router = createRouter({
  routeTree,
  context: undefined as unknown as RouterContext
});

function AuthRouter() {
  const {
    isError,
    isPending,
    data: userData
  } = useQuery({
    queryKey: meKeys.me(),
    queryFn: getUserInfo,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1
  });
  const clearAuth = useAuthStore((state) => state.clearAuth);
  if (isPending) {
    return <LoadingFullScreen className="w-screen h-screen" />;
  }
  if (isError) {
    clearAuth();
  }
  if (userData) {
    useAuthStore.getState().setAuth(userData.data);
  }
  return <RouterProvider router={router} context={{ queryClient }} />;
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthRouter />
      </QueryClientProvider>
    </StrictMode>
  );
}
