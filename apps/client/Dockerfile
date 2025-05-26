FROM node:22-alpine AS builder

ENV NODE_ENV=production

WORKDIR /app

RUN corepack enable

COPY . .

RUN yarn install

WORKDIR /app/apps/client
RUN yarn build

WORKDIR /app
CMD ["yarn", "client:prod"]

