FROM node:22-alpine AS builder

ENV NODE_ENV=production

# 1. 작업 디렉토리 설정 (루트 기준)
WORKDIR /app

RUN corepack enable

# 2. 전체 모노레포 복사 (Zero-Install용 캐시도 포함)
COPY . .

# 3. 루트에서 yarn install 수행 (workspace 전체 설치)
RUN yarn install --immutable

# 4. Next.js 앱 빌드 (웹 앱 기준으로 이동 후 실행)
WORKDIR /app/apps/client
RUN yarn build

WORKDIR /app
CMD ["yarn", "client:prod"]

# 5. 런타임 이미지
# FROM node:22-alpine AS runner
# WORKDIR /app

# RUN corepack enable

# COPY --from=builder /app/apps/client/ ./apps/client/
# COPY --from=builder /app/.yarn ./.yarn
# COPY --from=builder /app/.pnp.cjs ./
# COPY --from=builder /app/.yarnrc.yml ./
# COPY --from=builder /app/package.json ./
# COPY --from=builder /app/yarn.lock ./

# RUN yarn install

# EXPOSE 3000

# CMD ["yarn", "client:prod"]