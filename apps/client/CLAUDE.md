# kokomen-client

AI 모의 면접 서비스의 Next.js 15 프론트엔드 (Pages Router).

## Documentation Map

| 문서 | 내용 |
|------|------|
| [docs/architecture.md](docs/architecture.md) | 기술 스택, 디렉토리 구조, 프로바이더 계층, API 계층, 인증 흐름 |
| [docs/domains.md](docs/domains.md) | 도메인별 상세 가이드 (파일 역할, 수정 시 주의사항) |
| [docs/conventions.md](docs/conventions.md) | 코딩 컨벤션, 새 기능 추가 절차, 테스트, 빌드 |
| [docs/routing.md](docs/routing.md) | 전체 페이지 라우트 맵, 인증 미들웨어, SEO |
| [docs/infrastructure.md](docs/infrastructure.md) | Docker, Blue-Green 배포, ATS, GitHub Actions, 모니터링 |
| [docs/traefik-prod-migration.md](docs/traefik-prod-migration.md) | prod 리버스 프록시 ATS → Traefik 전환 절차 / 롤백 |

## Quick Reference

- 도메인 로직 수정: `src/domains/{domain}/` → [docs/domains.md](docs/domains.md)
- 새 페이지/라우트 추가: [docs/routing.md](docs/routing.md) + [docs/conventions.md](docs/conventions.md)
- API 연동 추가: [docs/conventions.md](docs/conventions.md) (API 호출 패턴)
- 배포/인프라 이슈: [docs/infrastructure.md](docs/infrastructure.md)
- 아키텍처 이해: [docs/architecture.md](docs/architecture.md)

## Commands

```bash
yarn dev          # 개발 서버 (HTTPS)
yarn build        # 프로덕션 빌드
yarn test         # Jest 테스트
yarn lint         # ESLint
yarn analyze      # 번들 분석
```
