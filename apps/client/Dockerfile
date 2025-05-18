# 1. Node base image
FROM node:22-alpine

# 2. 앱 디렉토리 생성
WORKDIR /app

# 3. Git에 포함된 Yarn 캐시/설정 파일 복사
COPY .yarn/ .yarn/
COPY .yarnrc.yml ./
COPY .pnp.cjs ./
COPY package.json ./
COPY tsconfig.json ./
COPY apps/ ./apps/

# 4. Yarn 설치 (Zero-Install이므로 install X)
RUN corepack enable && yarn --immutable

# 5. 실행
CMD ["yarn", "client:dev"]
