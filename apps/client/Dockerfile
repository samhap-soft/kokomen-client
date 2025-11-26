# 빌드 단계
FROM node:lts-alpine AS builder

WORKDIR /app

COPY .yarnrc.yml package.json yarn.lock ./
COPY ./.yarn ./.yarn

COPY .pnp.cjs .pnp.cjs
COPY .pnp.loader.mjs .pnp.loader.mjs
COPY tsconfig.base.json tsconfig.base.json

COPY ./apps/client ./apps/client
COPY ./packages ./packages

RUN corepack enable
RUN yarn install

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

# 최종 실행 이미지
FROM node:lts-alpine AS runner

WORKDIR /app
# 실행에 필수적인 Yarn PnP 파일들 복사
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/.pnp.cjs ./.pnp.cjs
COPY --from=builder /app/yarn.lock ./yarn.lock

# 모노레포 루트의 package.json 복사 (PnP 로더가 루트를 식별하는 데 필요)
COPY --from=builder /app/package.json ./package.json 

# 꼬꼬면 클라이언트 워크스페이스 폴더와 그 결과물을 원래 위치에 복사
COPY --from=builder /app/apps/client /app/apps/client
RUN corepack enable

EXPOSE 3000

CMD ["yarn", "client:prod"]