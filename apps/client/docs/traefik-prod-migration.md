# Prod 리버스 프록시 전환: ATS → Traefik

dev는 nginx → Traefik 전환이 끝났고, prod는 아직 Apache Traffic Server(ATS)로 동작한다.
**CD(`deploy.yml`)만 돌려서는 절대 Traefik으로 바뀌지 않는다.** prod 배포 경로는
`deploy.yml` → `scripts/blue-green-deploy.sh` → `docker/client/compose.yaml`의 `ats`
서비스로 고정돼 있고, Traefik 기동에 필요한 호스트 준비(`/opt/kokomen/traefik/prod`)가
없기 때문이다. 아래 절차를 사람이 한 번 실행해야 한다.

## 전환 전 / 후

| 항목 | 전환 전 | 전환 후 |
| --- | --- | --- |
| 프록시 | `kokomen-ats` (80/443) | `kokomen-traefik` (80/443) |
| 설정 | `trafficserver/prod/**` | `traefik/prod/**` → `/opt/kokomen/traefik/prod` 로 동기화 |
| 배포 스크립트 | `scripts/blue-green-deploy.sh` | `scripts/blue-green-deploy-prod.sh` |
| 트래픽 전환 | `remap.config` 렌더 → `traffic_ctl config reload` | `dynamic/client.yaml`의 `service:` 한 줄 rename |
| ACME(HTTP-01) | HTTP 전체가 HTTPS로 리다이렉트돼 webroot 갱신 불가 | `/.well-known/acme-challenge/` 예외 라우터로 무중단 갱신 |
| 고정 IP | ATS HostDB stale 회피용으로 필요 | 불필요(요청마다 도커 DNS 재해석) |

동작이 달라지는 지점은 두 개뿐이다.

- **X-Real-IP**: ATS는 넣어줬지만 Traefik은 넣지 않는다. 앱이 `X-Forwarded-For`를
  먼저 보도록 이미 맞춰져 있다(`src/utils/clientIp.ts`). 추가 작업 없음.
- **캐시**: ATS는 캐싱 프록시지만 `records.yaml`에서 `http.cache.http: 0`으로 꺼둔
  상태였다. Traefik에 캐시가 없어도 실질적 차이가 없다.

## 0. 사전 확인 (prod 호스트)

```bash
# 인증서 (없으면 중단)
sudo ls -l /etc/letsencrypt/live/kokomen.kr/{fullchain,privkey}.pem
# ACME webroot
ls -ld /var/www/certbot || sudo mkdir -p /var/www/certbot
# 현재 무엇이 트래픽을 받고 있는지
docker ps --filter "name=kokomen-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
docker exec kokomen-ats cat /opt/etc/trafficserver/remap.config | grep kokomen-client
```

마지막 명령의 색상(blue/green)이 현재 활성 색상이다. 마이그레이션 스크립트는 이 색을
그대로 이어받으므로 **앱 컨테이너는 재기동되지 않는다**(프록시만 갈아탄다).

## 1. 코드를 main에 반영

`traefik/prod/**`, `scripts/blue-green-deploy-prod.sh`,
`scripts/migrate-ats-to-traefik-prod.sh`, `scripts/traefik-cert-reload-hook.sh`,
`docker/client/compose.yaml`(traefik/certbot-webroot 서비스 추가),
`.github/workflows/deploy.yml`(배포 스크립트 자동 선택)을 머지한다.

**머지 시점과 전환 시점의 순서는 상관없다.** `deploy.yml`이 호스트 상태를 보고
스크립트를 고르기 때문이다.

- `kokomen-ats`가 실행 중 → `blue-green-deploy.sh` (ATS)
- ATS 정지 + `/opt/kokomen/traefik/prod/dynamic` 존재 → `blue-green-deploy-prod.sh` (Traefik)
- 둘 다 아니면 배포를 실패시킨다(엉뚱한 상태에서 프록시를 건드리지 않도록)

그래서 머지만 해두고 CD가 돌아도 배포 동작은 변하지 않는다. `compose.yaml`에 프록시
정의가 둘(`ats`, `traefik`) 생기지만, 스크립트가 서비스명을 지정해서 올리기 때문에
충돌하지 않는다.

> ⚠️ 머지 주의: `development` → `main` 머지 시 `scripts/blue-green-deploy.sh`에서
> 주석 한 줄만 충돌로 뜨고 본문이 조용히 `docker cp` 버전으로 되돌아간다.
> main의 EBUSY 픽스(`sed ... > "$REMAP_CONFIG"`, 호스트 파일 직접 쓰기)를 유지해야 한다.
> 전환이 끝나면 이 파일 자체를 삭제하므로 신경 쓸 일이 없어진다.

## 2. 마이그레이션 실행 (다운타임 수초)

트래픽이 적은 시간대에, prod 호스트의 리포 루트에서 실행한다.

```bash
cd <리포 경로>   # deploy.yml이 checkout하는 러너 워크스페이스
sudo DOCKER_USERNAME=<도커허브계정> ./scripts/migrate-ats-to-traefik-prod.sh .env
```

- `DOCKER_USERNAME`을 넘기는 이유: prod `deploy.yml`은 이 값을 셸 환경으로만 주입하고
  `.env`에 쓰지 않기 때문에 수동 실행 시 비어 있다. 없으면 이미지 이름이
  `/kokomen-client-prod:production`이 되어 실패한다.
- 확인 프롬프트를 건너뛰려면 `MIGRATE_YES=1`.

스크립트가 하는 일:

1. 사전 점검(인증서 / webroot / 네트워크 / ATS 실행 여부)
2. ATS `remap.config`에서 현재 활성 색상 판별
3. `/opt/kokomen/traefik/prod`에 설정 복사, 활성 색상으로 `client.yaml` 렌더,
   배포 유저로 소유권 이전
4. `certbot-webroot` 기동(포트 미사용이라 ATS와 공존)
5. **다운타임 없는 사전 검증**: 대체 포트 18081/18443에 같은 설정으로 Traefik을 띄워
   `kokomen.kr → 200`을 확인. 실패하면 여기서 멈추고 ATS는 그대로 살아 있다.
6. 다운타임 구간: `docker stop kokomen-ats` → Traefik 기동 → 포트 퍼블리시 확인
   → 헬스체크 → 라우팅 검증(HTTPS 200 / HTTP 301 / ACME 경로 비리다이렉트)
7. 실패 시 자동 롤백: Traefik 제거 → `docker start kokomen-ats` → 200 확인

ATS 컨테이너는 **제거하지 않고 정지 상태로 남긴다**. 설정이 그대로라 `docker start`
한 번으로 즉시 되돌아간다.

## 3. 외부에서 검증

```bash
curl -sI https://kokomen.kr/ | head -5
curl -sI http://kokomen.kr/ | head -5          # 301 https://kokomen.kr/
curl -s -o /dev/null -w '%{http_code}\n' http://kokomen.kr/.well-known/acme-challenge/probe  # 404 (301이면 안 됨)
docker logs --tail 50 kokomen-traefik
```

브라우저에서 로그인 → 면접 시작 → 이력서 분석까지 한 번 훑는다.
(SSR/스트리밍 응답이 프록시를 통해 정상 동작하는지 확인)

## 4. CD 확인 (워크플로우 수정 불필요)

`deploy.yml`은 이미 자동 선택이므로 손댈 것이 없다. main에 아무 커밋이나 밀어
CD를 한 번 돌리고 다음을 확인한다.

- 워크플로우 로그의 Blue-Green Deploy 스텝에
  `Traefik 설정 감지 -> ./scripts/blue-green-deploy-prod.sh 사용` notice가 뜨는지
- 색상이 교대(blue ↔ green)되는지, 전환 중 5xx가 없는지

안전장치는 두 겹이다. `deploy.yml`이 ATS 실행 중이면 Traefik 스크립트를 고르지 않고,
`blue-green-deploy-prod.sh` 자체도 ATS가 떠 있으면 아무것도 하지 않고 멈춘다.

## 5. 인증서 갱신 훅 등록 (필수)

Traefik은 `dynamic/` 디렉토리만 감시한다. certbot이 pem을 갱신해도 감시 대상이 아니라서
**메모리에 올려둔 옛 인증서를 계속 서빙한다**(로컬 검증에서 재현 확인됨).
`dynamic/tls.yaml`을 같은 내용으로 다시 쓰면 리로드가 걸리고 새 인증서를 읽는다.

```bash
sudo TRAEFIK_CONFIG_DIR=/opt/kokomen/traefik/prod ./scripts/traefik-cert-reload-hook.sh --install
sudo certbot renew --dry-run
```

`/etc/letsencrypt/renewal-hooks/deploy/10-traefik-reload.sh`가 생성된다(리포에 의존하지
않는 독립 스크립트). **dev 서버에도 같은 작업이 필요하다**:

```bash
sudo TRAEFIK_CONFIG_DIR=/opt/kokomen/traefik/dev ./scripts/traefik-cert-reload-hook.sh --install
```

## 6. 롤백

```bash
# 즉시 (프록시만 ATS로 되돌림, 앱 컨테이너 그대로)
docker compose --env-file .env -f ./docker/client/compose.yaml stop traefik
docker start kokomen-ats
curl -sI https://kokomen.kr/ | head -3
```

워크플로우는 되돌릴 필요가 없다. ATS가 다시 실행 중이면 다음 배포부터 `deploy.yml`이
자동으로 ATS 스크립트를 고른다. ATS 스크립트가 `remap.config`를 다시 렌더하므로
색상 정보가 어긋나도 알아서 맞춰진다.

## 7. 안정화 후 정리 (며칠 관찰 뒤)

- `docker rm kokomen-ats`
- `docker/client/compose.yaml`에서 `ats` 서비스와 고정 IP(`ipv4_address`) 제거
  — 고정 IP는 ATS HostDB 회피용이었고 Traefik에는 불필요
- `trafficserver/prod/**`, `scripts/blue-green-deploy.sh` 삭제
- `nginx/nginx.prod.conf`, `nginx/nginx.dev.conf` 삭제(더 이상 참조되지 않음)
- `scripts/blue-green-deploy-prod.sh` → `blue-green-deploy.sh`로 이름 정리 후
  `deploy.yml`의 스크립트 자동 선택 분기를 지우고 한 줄 호출로 되돌리기
- `docs/infrastructure.md`의 ATS 섹션을 Traefik 기준으로 갱신
