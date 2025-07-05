import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { JSX } from "react";
import { Toaster } from "@kokomen/ui/components/toast/toaster";
import { ErrorBoundary } from "@sentry/nextjs";
import Error from "@/pages/_error";

const queryClient: QueryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        fallback={<Error statusCode={500} hasGetInitialProps={false} />}
      >
        <Toaster>
          <Component {...pageProps} />
        </Toaster>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
