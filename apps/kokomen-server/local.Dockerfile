FROM node:22-alpine

WORKDIR /app

RUN corepack enable

# Yarn Berry (PnP) 환경에서는 .yarn 캐시와 .pnp.cjs가 필요
# 컨테이너 시작 시 yarn install 실행
CMD ["yarn", "server:dev"]