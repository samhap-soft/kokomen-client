FROM node:22-alpine AS builder

ENV NODE_ENV=production

WORKDIR /app

RUN corepack enable

COPY . .

ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN yarn install

WORKDIR /app/apps/client
RUN yarn build

WORKDIR /app
CMD ["yarn", "client:prod"]