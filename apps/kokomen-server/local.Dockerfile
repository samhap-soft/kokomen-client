FROM node:22-alpine

WORKDIR /app

RUN corepack enable

# apps, packages는 볼륨 마운트로 런타임에 제공됨
CMD yarn install && yarn server:dev