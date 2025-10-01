/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_SENTRY_AUTH_TOKEN: string;
  readonly VITE_POSTHOG_KEY: string;
  readonly VITE_POSTHOG_HOST: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_V2_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: number;
  readonly VITE_WEB_BASE_URL: string;
  readonly VITE_CDN_BASE_URL: string;
  readonly VITE_GRAPHQL_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
