FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY . .

RUN yarn install

RUN yarn types:build

WORKDIR /app
CMD ["yarn", "server:start"]