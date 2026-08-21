# 인프라 & 배포

> 아래는 현재 prod 기준(ATS)이다. dev는 이미 Traefik으로 전환됐고, prod 전환 절차는
> [traefik-prod-migration.md](traefik-prod-migration.md)에 있다. CD만 돌려서는 전환되지 않는다.

## 배포 구조

```
[GitHub Actions] → Docker 이미지 빌드/푸시 → 서버에서 Blue-Green 배포
                                                    │
                                            ┌───────┴───────┐
                                            │  ATS (80/443) │ ← 리버스 프록시
                                            └───────┬───────┘
                                        ┌───────────┼───────────┐
                                        │ blue (3000)│ green (3000)│
                                        └───────────┴───────────────┘
                                        (172.30.0.10)   (172.30.0.11)
```

## Blue-Green 배포 (`scripts/blue-green-deploy.sh`)

1. 현재 활성 컨테이너 색상 감지 (blue/green)
2. ATS 컨테이너 상태 동기화 (네트워크 드리프트 자동 수정)
3. 새 색상 컨테이너 시작
4. 헬스체크 (localhost:3000, 최대 30회 × 2초 간격)
5. `remap.config` 업데이트 (호스트 파일 직접 수정 → bind mount로 컨테이너에 반영)
6. ATS `traffic_ctl config reload` (무중단 설정 리로드)
7. 이전 컨테이너 정리 (5초 대기 후 stop/rm)

## Docker Compose (`docker/client/compose.yaml`)

- `client-blue` / `client-green`: 프로필 기반 선택적 기동
- `ats`: Apache Traffic Server (리버스 프록시, SSL 종료)
- 네트워크: `kokomen-net` (172.30.0.0/24) 고정 IP 할당

## ATS (Apache Traffic Server)

- 설정 파일: `trafficserver/prod/` 디렉토리
- `remap.config.tmpl` → 배포 시 `CLIENT_BACKEND` 치환하여 `remap.config` 생성
- SSL: Let's Encrypt 인증서 (`/etc/letsencrypt` bind mount)
- 설정 변경은 `traffic_ctl config reload`로 무중단 반영

## GitHub Actions

| 워크플로우 | 설명 |
|-----------|------|
| `deploy.yml` | 클라이언트 프로덕션 배포 |
| `deploy-dev.yml` | 클라이언트 개발 배포 |
| `deploy-storybook.yml` | Storybook 배포 |
| `deploy-nest-prod.yml` | NestJS 서버 프로덕션 배포 |
| `deploy-nest-dev.yml` | NestJS 서버 개발 배포 |

## 환경별 차이

- **dev**: `docker/client/compose.dev.yaml` 사용, 단일 컨테이너
- **prod**: `docker/client/compose.yaml` + Blue-Green 배포
- **local**: `docker/server/compose.local.yaml` (서버 로컬 개발)

## Dockerfile (멀티스테이지)

```
base → deps → builder → runner
```

- `entrypoint.sh`로 런타임 환경 변수 주입
- 프로덕션 이미지: `node:alpine` 기반 경량화

## 모니터링

- **Sentry**: 에러 추적 + 소스맵 업로드 (CI에서만)
  - tunnelRoute: `/monitoring` (ad-blocker 우회)
- **PostHog**: 사용자 분석
- **Lighthouse CI**: 성능 모니터링 (`lighthouserc.js`)
