# 🍜 꼬꼬면 (Kokomen)

> AI 기반 모의 면접 플랫폼 - 당신의 면접 준비를 돕는 똑똑한 파트너


[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Yarn Version](https://img.shields.io/badge/yarn-%3E%3D4.0.0-blue)](https://yarnpkg.com)

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [개발 환경 설정](#-개발-환경-설정)
- [배포](#-배포)
- [테스트](#-테스트)
- [성능 최적화](#-성능-최적화)
- [기여하기](#-기여하기)
- [라이선스](#-라이선스)

## 🎯 프로젝트 소개

**꼬꼬면**은 AI 기술을 활용한 혁신적인 모의 면접 서비스입니다. 실제 면접과 유사한 환경에서 연습할 수 있도록 도와주며, AI 면접관과의 대화를 통해 면접 실력을 향상시킬 수 있습니다.

### 핵심 가치

- **실전같은 연습**: 3D 아바타 면접관과 실제 면접 환경 시뮬레이션
- **맞춤형 피드백**: AI 기반 답변 분석 및 개선점 제안
- **다양한 직무 지원**: 프론트엔드, 백엔드, 네트워크, OS 등 다양한 IT 직무 면접 준비
- **커뮤니티 기반 학습**: 다른 사용자들의 우수 답변 참고 및 랭킹 시스템

## ✨ 주요 기능

### 1. AI 모의 면접
- 🎤 **음성 인식 기반 면접**: 실시간 음성 인식을 통한 자연스러운 면접 진행
- 🤖 **3D 아바타 면접관**: WebGL 기반 3D 면접관으로 실감나는 면접 경험
- 📝 **텍스트/음성 모드**: 사용자 선호에 따른 답변 방식 선택 가능

### 2. 면접 분석 및 피드백
- 📊 **상세한 리포트**: 답변별 점수, 개선점, 모범 답안 제공
- 💡 **AI 피드백**: GPT 기반 맞춤형 피드백 및 개선 방향 제시
- 📈 **성장 추적**: 면접 이력 관리 및 실력 향상 추이 분석

### 3. 커뮤니티 및 랭킹
- 🏆 **랭킹 시스템**: 주간/월간 우수 면접자 랭킹
- 👥 **답변 공유**: 다른 사용자의 우수 답변 참고 기능
- 🔍 **면접 질문 데이터베이스**: 카테고리별 실제 면접 질문 아카이브

### 4. 사용자 경험
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 완벽 지원
- 🌙 **다크 모드**: 눈의 피로를 줄이는 다크 테마 지원
- 🔔 **실시간 알림**: 면접 결과, 랭킹 변동 등 주요 이벤트 알림

## 🛠 기술 스택

### Frontend

#### 웹 애플리케이션 (Client)
- **Framework**: Next.js 15.3 (App Router)
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand, React Query v5
- **3D Graphics**: Three.js, React Three Fiber
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: 자체 디자인 시스템 (@kokomen/ui)

#### 모바일 애플리케이션 (Native)
- **Framework**: React Native + Expo
- **Navigation**: React Navigation
- **Speech Recognition**: Expo Speech Recognition

### Backend & Infrastructure

#### API & Services
- **Runtime**: Node.js 18+
- **API Communication**: Axios
- **Real-time**: WebSocket (음성 스트리밍)

#### DevOps & Monitoring
- **Container**: Docker & Docker Compose
- **Error Tracking**: Sentry
- **Analytics**: PostHog
- **Performance**: Lighthouse CI
- **CI/CD**: GitHub Actions

### Development Tools

#### Build & Bundle
- **Package Manager**: Yarn Berry (v4.9.2) with Workspaces
- **Bundler**: 
  - Next.js: Turbopack
  - Webview: Vite
  - UI Library: Storybook with Vite
- **Module Resolution**: Plug'n'Play (PnP)

#### Code Quality
- **Linting**: ESLint with custom config
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: 
  - Jest + React Testing Library
  - Vitest (Webview)
  - Coverage reporting with Istanbul

## 📁 프로젝트 구조

```
kokomen/                        # 애플리케이션 모노레포
├── apps/                       # 애플리케이션 패키지들
│   ├── client/                 # Next.js 웹 애플리케이션
│   │   ├── src/
│   │   │   ├── domains/        # 도메인별 비즈니스 로직
│   │   │   │   ├── auth/       # 인증/인가
│   │   │   │   ├── interview/  # 면접 진행
│   │   │   │   ├── dashboard/  # 대시보드
│   │   │   │   ├── members/    # 멤버/랭킹
│   │   │   │   └── notifications/ # 알림
│   │   │   ├── pages/          # Next.js 페이지 라우팅
│   │   │   ├── shared/         # 공통 컴포넌트
│   │   │   └── utils/          # 유틸리티 함수
│   │   ├── public/             # 정적 자산
│   │   └── __tests__/          # 테스트 파일
│   │
│   ├── kokomen-webview/        # React 기반 웹뷰 애플리케이션
│   │   └── src/
│   │       ├── routes/         # TanStack Router
│   │       └── domains/        # 도메인 로직
│   │
│   └── kokomen-native/         # React Native 모바일 앱
│       ├── ios/                # iOS 네이티브 코드
│       ├── android/            # Android 네이티브 코드
│       └── src/
│           ├── screens/        # 화면 컴포넌트
│           └── router/         # 내비게이션
│
├── packages/                   # 공유 패키지
│   ├── ui/                     # 디자인 시스템 & UI 라이브러리
│   │   ├── src/
│   │   │   └── components/     # 재사용 가능한 UI 컴포넌트
│   │   └── storybook-static/   # Storybook 빌드
│   │
│   ├── kokomen-utils/          # 공통 유틸리티
│   │   └── src/
│   │       ├── general/        # 일반 유틸리티
│   │       └── react/          # React 전용 훅
│   │
│   ├── types/                  # TypeScript 타입 정의
│   │   └── src/
│   │       ├── auth/
│   │       ├── interviews/
│   │       └── members/
│   │
│   └── eslint-config/          # 공유 ESLint 설정
│
├── compose.yaml            # 프로덕션 Docker Compose
├── compose.dev.yaml        # 개발 환경 Docker Compose
──
```

### 모노레포 구조

프로젝트는 Yarn Workspaces를 사용한 모노레포 구조로 구성되어 있습니다:

- **apps/**: 실제 배포되는 애플리케이션들
- **packages/**: 애플리케이션 간 공유되는 코드와 설정
- **독립적 배포**: 각 애플리케이션은 독립적으로 빌드 및 배포 가능
- **코드 재사용**: UI 컴포넌트, 유틸리티, 타입 정의 공유

## 🚀 시작하기

### 필수 요구사항

- Node.js >= 18.0.0
- Yarn >= 4.0.0
- Docker & Docker Compose (선택사항)

### 설치

```bash
# 레포지토리 클론
git clone https://github.com/samhap-soft/kokomen.git
cd kokomen

# 의존성 설치 (Yarn PnP 사용)
yarn install

# 환경 변수 설정
cp apps/client/.env.example apps/client/.env.local
```

### 개발 서버 실행

```bash
# 웹 애플리케이션 개발 서버
yarn client:dev

# 웹뷰 개발 서버
yarn webview:dev

# UI 컴포넌트 Storybook
yarn ui:dev

# 모든 서비스 동시 실행 (Docker)
yarn docker-dev-up
```

## 🔧 개발 환경 설정

### 주요 스크립트

```bash
# 개발
yarn client:dev        # Next.js 개발 서버 (https://localhost:3000)
yarn webview:dev       # Vite 개발 서버
yarn ui:dev           # Storybook UI 개발

# 빌드
yarn build            # 프로덕션 빌드
yarn types:build      # TypeScript 타입 빌드

# 테스트
yarn test             # 모든 테스트 실행
yarn client:test      # Client 앱 테스트
yarn webview:test     # Webview 테스트

# 코드 품질
yarn lint             # ESLint 실행
yarn lhci             # Lighthouse CI 성능 테스트
```

### 환경 변수

```env
# API 엔드포인트
NEXT_PUBLIC_API_URL=https://api.kokomen.kr

# 인증
NEXT_PUBLIC_AUTH_URL=https://kokomen.kr
NEXT_PUBLIC_OAUTH_CLIENT_ID=your_client_id

# 모니터링
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key

```

## 📦 배포

### 프로덕션 빌드

```bash
# Next.js 프로덕션 빌드
yarn build

# Docker 이미지 빌드
docker build -t kokomen-client ./apps/client

# Docker Compose로 실행
yarn docker-prod-up
```

### CI/CD 파이프라인

GitHub Actions를 통한 자동 배포:

1. **PR 생성 시**: 린트, 타입 체크, 테스트 실행
2. **main 브랜치 머지**: 프로덕션 빌드 및 배포
3. **성능 모니터링**: Lighthouse CI 자동 실행

## 🧪 테스트

### 단위 테스트

```bash
# Jest 테스트 실행(웹뷰 + 웹 둘 다 실행)
yarn test

# 웹 테스트
yarn client:test
# 웹뷰 테스트
yarn webview:test

```



### 성능 테스트

```bash
# Lighthouse CI 실행
cd apps/client && yarn lhci

# Bundle 분석
cd apps/client && yarn analyze
```

## ⚡ 성능 최적화

### 적용된 최적화 기법

1. **코드 스플리팅**: Next.js 자동 코드 스플리팅
2. **이미지 최적화**: Next/Image 컴포넌트 활용
3. **폰트 최적화**: 로컬 폰트 사용 및 font-display: swap
4. **번들 최적화**:
   - Tree shaking
   - Dynamic imports
   - Webpack 최적화

### 성능 지표

- **Lighthouse Score**: 95+ (Performance)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 200KB (초기 로드)



### 코드 스타일 가이드
- ESLint 규칙 준수
- Prettier 포맷팅 적용
- TypeScript strict mode 사용
- 컴포넌트는 함수형 컴포넌트 사용
- Custom Hooks는 `use` 접두사 사용


<div align="center">
  <strong>🍜 꼬꼬면과 함께 성공적인 면접을 준비하세요!</strong>
</div>