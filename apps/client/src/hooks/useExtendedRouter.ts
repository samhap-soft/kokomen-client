import { useRouter, NextRouter } from "next/router";
import { useMemo } from "react";

type ExtendedRouter = NextRouter & {
  navigateToLogin: () => void;
};

export default function useExtendedRouter(): ExtendedRouter {
  const router = useRouter();

  const navigateToLogin = useMemo(
    () => () => {
      const redirectTo = router.asPath;
      router.push(`/login?redirectTo=${redirectTo}`);
    },
    [router]
  );

  return useMemo(
    () => ({
      ...router,
      navigateToLogin
    }),
    [router, navigateToLogin]
  ) as ExtendedRouter;
}
