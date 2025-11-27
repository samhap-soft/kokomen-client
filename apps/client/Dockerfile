# ✅ 빌드 단계
FROM node:22-alpine AS builder

WORKDIR /app

COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn .yarn
COPY .pnp.cjs .pnp.cjs
COPY .pnp.loader.mjs .pnp.loader.mjs
COPY tsconfig.base.json tsconfig.base.json

COPY apps apps
COPY packages packages

RUN corepack enable
RUN yarn install --immutable

ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_V2_API_BASE_URL
ARG NEXT_PUBLIC_NOTIFICATION_API_BASE_URL
ARG NEXT_PUBLIC_V3_API_BASE_URL
ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_CDN_BASE_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG SENTRY_AUTH_TOKEN
ARG NODE_ENV

RUN yarn workspace @kokomen/client build


# ✅ 실행(런타임) 단계
FROM node:22-alpine AS runner

WORKDIR /app
RUN corepack enable

# ✅ Yarn PnP 환경 그대로 가져오기
COPY --from=builder /app/.yarn .yarn
COPY --from=builder /app/.pnp.cjs .pnp.cjs
COPY --from=builder /app/.pnp.loader.mjs .pnp.loader.mjs
COPY --from=builder /app/yarn.lock yarn.lock
COPY --from=builder /app/package.json package.json

# ✅ monorepo workspace도 가져와야 PnP dependency graph 유지됨
COPY --from=builder /app/apps apps
COPY --from=builder /app/packages packages

EXPOSE 3000

# ✅ Next.js 일반 실행
CMD ["yarn", "workspace", "@kokomen/client", "start"]
