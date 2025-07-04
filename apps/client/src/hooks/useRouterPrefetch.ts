import { useRouter } from "next/router";
import { useEffect } from "react";

export default function useRouterPrefetch(path: string): void {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(path);
  }, [router, path]);
}
