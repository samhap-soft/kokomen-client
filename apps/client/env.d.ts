declare const process: {
  env: {
    ANALYZE: string;
    NODE_ENV?: string;
    CI: string;
    SENTRY_AUTH_TOKEN: string;
    NEXT_PUBLIC_POSTHOG_KEY: string;
    NEXT_PUBLIC_POSTHOG_HOST: string;
    NEXT_PUBLIC_BASE_URL: string;
    NEXT_PUBLIC_NOTIFICATION_API_BASE_URL: string;
    NEXT_PUBLIC_GRAPHQL_URL: string;
    NEXT_PUBLIC_API_BASE_URL: string;
    NEXT_PUBLIC_V2_API_BASE_URL: string;
    NEXT_PUBLIC_V3_API_BASE_URL: string;
    NEXT_PUBLIC_CDN_BASE_URL: string;
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: string;
    NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY: string;
    /** "enabled" 이면 개발 서버에서 MSW 브라우저 목을 켠다 (yarn dev:mock) */
    NEXT_PUBLIC_API_MOCKING?: string;
  };
};
