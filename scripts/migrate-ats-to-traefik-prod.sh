#!/bin/bash
set -euo pipefail

# ATS -> Traefik 최초 마이그레이션 스크립트 (Prod, 1회성)
# 사용법: sudo ./scripts/migrate-ats-to-traefik-prod.sh [.env]
#        (확인 프롬프트를 건너뛰려면 MIGRATE_YES=1)
#
# dev의 scripts/migrate-nginx-to-traefik-dev.sh와 같은 구조이고, 다음이 다르다.
#   1. 걷어내는 대상이 nginx가 아니라 ATS다. ATS 컨테이너는 "정지만" 하고 남겨둔다.
#      설정(remap.config)이 그대로라서 docker start 한 번으로 즉시 롤백된다.
#   2. 현재 활성 색상을 blue로 강제하지 않고, ATS remap.config이 가리키던 색을 읽어
#      그 색으로 Traefik 라우팅을 렌더한다. 즉 프록시만 갈아타고
#      클라이언트 컨테이너는 재기동하지 않는다(앱 버전 변화 0).
#   3. prod 네트워크는 compose가 관리하는 내부 네트워크라 이름에 프로젝트 접두어가
#      붙는다(예: client_kokomen-net). 사전 검증 컨테이너용으로 실제 이름을 조회한다.
#
# ATS와 Traefik은 둘 다 80/443을 쓰므로 동시에 띄울 수 없다.
# 따라서 이 스크립트에는 ATS 정지 ~ Traefik 기동 사이 수초의 다운타임이 있다.
# 트래픽이 적은 시간대에 실행하고, 실패 시에는 자동으로 ATS를 되살린다.

ENV_FILE="${1:-.env}"
COMPOSE_FILE="./docker/client/compose.yaml"

REPO_CONFIG_DIR="./traefik/prod"
LIVE_CONFIG_DIR="${TRAEFIK_CONFIG_DIR:-/opt/kokomen/traefik/prod}"
LIVE_DYNAMIC_DIR="${LIVE_CONFIG_DIR}/dynamic"
LIVE_ROUTE_FILE="${LIVE_DYNAMIC_DIR}/client.yaml"

SERVICE_HOST="kokomen.kr"

# compose가 이미지 이름을 보간할 때 쓰는 값.
# prod deploy.yml은 셸 환경으로만 주입하고 .env에는 넣지 않으므로,
# 수동 실행 시에는 비어 있을 가능성이 높다. 없으면 여기서 멈춘다.
if [ -z "${DOCKER_USERNAME:-}" ] && [ -f "$ENV_FILE" ]; then
  DOCKER_USERNAME="$(sed -n 's/^DOCKER_USERNAME=//p' "$ENV_FILE" | tail -1 | tr -d '"'"'"'')"
  export DOCKER_USERNAME
fi
if [ -z "${DOCKER_USERNAME:-}" ]; then
  echo "[ERROR] DOCKER_USERNAME이 설정되지 않았습니다."
  echo "        이 값이 없으면 이미지 이름이 '/kokomen-client-prod:production'이 되어 실패합니다."
  echo ""
  echo "        해결 방법 중 하나:"
  echo "          DOCKER_USERNAME=<도커허브계정> $0 $ENV_FILE"
  echo "          또는 $ENV_FILE 에 DOCKER_USERNAME=<도커허브계정> 추가"
  exit 1
fi

echo "========================================="
echo " ATS -> Traefik 마이그레이션: Prod"
echo "========================================="
echo "[INFO] DOCKER_USERNAME=$DOCKER_USERNAME"
echo "[INFO] 라이브 설정 경로: $LIVE_CONFIG_DIR"

# curl의 http_code만 얻는다. 127.0.0.1을 명시하는 이유:
#   "localhost"는 ::1로 먼저 해석될 수 있고, Docker의 포트 퍼블리시는
#   기본적으로 IPv4(0.0.0.0)만 잡아서 연결 실패(000)로 보일 수 있다.
# 실패해도 curl이 이미 "000"을 출력하므로 `|| echo`로 덧붙이면 안 된다(000000이 된다).
http_code() {
  local host="$1" url="$2"
  curl -sk -o /dev/null -w '%{http_code}' --max-time 5 \
    -H "Host: ${host}" "$url" 2>/dev/null || true
}

# ATS를 되살린다. 실패 경로에서만 호출한다.
restore_ats() {
  echo "[ROLLBACK] Traefik 정리 후 ATS 복구..."
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop traefik >/dev/null 2>&1 || true
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" rm -f traefik >/dev/null 2>&1 || true
  docker start kokomen-ats >/dev/null 2>&1 || true
  for _ in $(seq 1 15); do
    if [ "$(http_code "$SERVICE_HOST" "https://127.0.0.1/")" = "200" ]; then
      echo "[ROLLBACK] ATS 복구 확인 (${SERVICE_HOST} 200)"
      return 0
    fi
    sleep 2
  done
  echo "[ROLLBACK][WARN] ATS 복구 후에도 200을 받지 못했습니다. 즉시 수동 확인 필요:"
  echo "                 docker ps -a --filter name=kokomen-"
  echo "                 docker logs --tail 80 kokomen-ats"
  return 1
}

# ---------------------------------------------------------------------------
# 1. 사전 점검
# ---------------------------------------------------------------------------
echo "[1/9] 사전 점검..."

if docker ps --format '{{.Names}}' | grep -qx "kokomen-traefik"; then
  echo "[INFO] kokomen-traefik이 이미 실행 중입니다. 마이그레이션이 끝난 상태로 보입니다."
  echo "       이후 배포는 ./scripts/blue-green-deploy-prod.sh 를 사용하세요."
  exit 0
fi

if ! docker ps --format '{{.Names}}' | grep -qx "kokomen-ats"; then
  echo "[ERROR] ATS(kokomen-ats)가 실행 중이 아닙니다."
  echo "        현재 트래픽을 무엇이 받고 있는지 먼저 확인하세요. (docker ps)"
  echo "        의도적으로 ATS 없이 시작하려면 이 스크립트 대신"
  echo "        migrate 절차 문서(apps/client/docs/traefik-prod-migration.md)를 확인하세요."
  exit 1
fi

for f in fullchain.pem privkey.pem; do
  if [ ! -f "/etc/letsencrypt/live/${SERVICE_HOST}/${f}" ]; then
    echo "[ERROR] 인증서 없음: /etc/letsencrypt/live/${SERVICE_HOST}/${f}"
    exit 1
  fi
done
echo "[OK] 인증서 확인"

if [ ! -d /var/www/certbot ]; then
  echo "[ERROR] certbot webroot 없음: /var/www/certbot"
  echo "        ACME 챌린지 서빙에 필요합니다. sudo mkdir -p /var/www/certbot"
  exit 1
fi
echo "[OK] certbot webroot 확인"

# prod의 kokomen-net은 external이 아니라 compose가 만든 네트워크다.
# 실제 이름에 프로젝트 접두어가 붙기 때문에(예: client_kokomen-net)
# 현재 ATS가 붙어 있는 네트워크에서 이름을 그대로 가져온다.
DOCKER_NET="$(docker inspect -f '{{range $k, $_ := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}' kokomen-ats 2>/dev/null \
  | grep -m1 'kokomen-net' || true)"
if [ -z "$DOCKER_NET" ]; then
  DOCKER_NET="$(docker network ls --format '{{.Name}}' | grep -m1 'kokomen-net' || true)"
fi
if [ -z "$DOCKER_NET" ]; then
  echo "[ERROR] kokomen-net 네트워크를 찾지 못했습니다."
  echo "        docker network ls 로 확인하세요. ATS가 네트워크에 붙어 있지 않다면"
  echo "        먼저 ./scripts/blue-green-deploy.sh 로 정상 배포를 한 번 돌리세요."
  exit 1
fi
echo "[OK] docker network 확인: $DOCKER_NET"

# ---------------------------------------------------------------------------
# 2. 현재 활성 색상 판별 (실행 중인 ATS의 remap.config이 유일한 진실)
# ---------------------------------------------------------------------------
echo "[2/9] 현재 활성 색상 확인..."
ACTIVE_COLOR="$(docker exec kokomen-ats cat /opt/etc/trafficserver/remap.config 2>/dev/null \
  | grep -oE 'kokomen-client-(blue|green)' | head -1 | sed 's/kokomen-client-//' || true)"

if [ -z "$ACTIVE_COLOR" ]; then
  echo "[WARN] remap.config에서 색상을 읽지 못했습니다. 실행 중인 컨테이너로 추정합니다."
  for c in blue green; do
    if docker ps --format '{{.Names}}' | grep -qx "kokomen-client-${c}"; then
      ACTIVE_COLOR="$c"
      break
    fi
  done
fi
if [ -z "$ACTIVE_COLOR" ]; then
  echo "[ERROR] 활성 색상을 판별할 수 없습니다. 수동으로 확인 후 진행하세요."
  echo "        docker exec kokomen-ats cat /opt/etc/trafficserver/remap.config"
  exit 1
fi
ACTIVE_CONTAINER="kokomen-client-${ACTIVE_COLOR}"
echo "[OK] 활성 색상: $ACTIVE_COLOR ($ACTIVE_CONTAINER)"

if ! docker ps --format '{{.Names}}' | grep -qx "$ACTIVE_CONTAINER"; then
  echo "[INFO] $ACTIVE_CONTAINER 가 실행 중이 아닙니다. 기동합니다."
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile "$ACTIVE_COLOR" up -d "client-${ACTIVE_COLOR}"
fi

echo "[3/9] $ACTIVE_CONTAINER 헬스체크..."
for i in $(seq 1 30); do
  if docker exec "$ACTIVE_CONTAINER" wget -q --spider http://localhost:3000/ 2>/dev/null; then
    echo "[OK] $ACTIVE_CONTAINER 정상 (${i}/30)"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "[ERROR] $ACTIVE_CONTAINER 헬스체크 실패. ATS는 그대로 유지됩니다."
    docker logs --tail 50 "$ACTIVE_CONTAINER" || true
    exit 1
  fi
  sleep 2
done

# ---------------------------------------------------------------------------
# 3. 라이브 설정 디렉토리 생성 (리포 밖 — checkout이 건드리지 못하는 곳)
# ---------------------------------------------------------------------------
echo "[4/9] 라이브 설정 디렉토리 준비: $LIVE_CONFIG_DIR"
# Docker는 bind mount 소스가 없으면 그 경로에 "디렉토리"를 만들어 버린다.
# traefik.yaml 자리에 디렉토리가 생기면 Traefik이 정적 설정을 읽지 못하고
# 기본값으로 뜬다(= file provider 미기동, 라우팅 전무). 이전 실행에서 그렇게
# 만들어진 잔재가 있으면 여기서 치운다.
if [ -d "${LIVE_CONFIG_DIR}/traefik.yaml" ]; then
  echo "[WARN] ${LIVE_CONFIG_DIR}/traefik.yaml 가 디렉토리입니다(Docker가 자동 생성). 제거합니다."
  rmdir "${LIVE_CONFIG_DIR}/traefik.yaml" 2>/dev/null || rm -rf "${LIVE_CONFIG_DIR}/traefik.yaml"
fi
mkdir -p "$LIVE_DYNAMIC_DIR"
cp "${REPO_CONFIG_DIR}/traefik.yaml" "${LIVE_CONFIG_DIR}/traefik.yaml"
cp "${REPO_CONFIG_DIR}"/dynamic/*.yaml "$LIVE_DYNAMIC_DIR/"

if [ ! -f "${LIVE_CONFIG_DIR}/traefik.yaml" ]; then
  echo "[ERROR] 정적 설정 파일 생성 실패: ${LIVE_CONFIG_DIR}/traefik.yaml"
  exit 1
fi

# 리포의 client.yaml은 blue로 커밋돼 있다. 지금 트래픽을 받고 있는 색으로 맞춘다.
# 이렇게 해야 프록시만 교체되고 앱 컨테이너는 그대로 유지된다.
sed -E "s/^([[:space:]]*)service:[[:space:]]*client-(blue|green)[[:space:]]*$/\1service: client-${ACTIVE_COLOR}/" \
  "${REPO_CONFIG_DIR}/dynamic/client.yaml" > "${LIVE_CONFIG_DIR}/.client.yaml.tmp"
if ! grep -qE "^[[:space:]]+service:[[:space:]]*client-${ACTIVE_COLOR}[[:space:]]*$" "${LIVE_CONFIG_DIR}/.client.yaml.tmp"; then
  echo "[ERROR] 라우팅 파일 렌더 실패(client-${ACTIVE_COLOR}). 중단합니다."
  rm -f "${LIVE_CONFIG_DIR}/.client.yaml.tmp"
  exit 1
fi
mv "${LIVE_CONFIG_DIR}/.client.yaml.tmp" "$LIVE_ROUTE_FILE"

# 이 스크립트는 보통 sudo로 실행되지만, 이후 배포는 CI 러너 유저로 돌아간다.
# 소유권을 넘겨두지 않으면 다음 배포가 트래픽 전환 시점에 Permission denied로 실패한다.
# sudo로 실행됐으면 원래 유저(SUDO_USER)에게, 아니면 현재 유저에게 준다.
CONFIG_OWNER="${TRAEFIK_CONFIG_OWNER:-${SUDO_USER:-$(id -un)}}"
if chown -R "$CONFIG_OWNER" "$LIVE_CONFIG_DIR" 2>/dev/null; then
  echo "[OK] 설정 디렉토리 소유권: $CONFIG_OWNER"
else
  echo "[WARN] 소유권 변경 실패. 배포 유저가 쓸 수 없으면 다음을 실행하세요:"
  echo "         sudo chown -R <배포유저> $LIVE_CONFIG_DIR"
fi
echo "[OK] 설정 복사 완료 (활성 색상: $ACTIVE_COLOR)"

# ---------------------------------------------------------------------------
# 4. certbot webroot 기동 (포트를 쓰지 않으므로 ATS와 공존 가능)
# ---------------------------------------------------------------------------
echo "[5/9] certbot-webroot 기동..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d certbot-webroot

# ---------------------------------------------------------------------------
# 5. 사전 검증 (다운타임 없음)
#    ATS가 80/443을 쥐고 있는 동안, 같은 설정으로 대체 포트에 Traefik을 띄워
#    설정과 라우팅이 실제로 동작하는지 먼저 확인한다.
#    이걸 통과하지 못하면 다운타임을 아예 감수하지 않는다.
# ---------------------------------------------------------------------------
echo "[6/9] 사전 검증: 대체 포트(18081/18443)로 설정 확인 (다운타임 없음)..."
PROBE_NAME="kokomen-traefik-probe"
docker rm -f "$PROBE_NAME" >/dev/null 2>&1 || true
if ! docker run -d --name "$PROBE_NAME" \
  --network "$DOCKER_NET" \
  -p 127.0.0.1:18081:80 -p 127.0.0.1:18443:443 \
  -v "${LIVE_CONFIG_DIR}/traefik.yaml:/etc/traefik/traefik.yaml:ro" \
  -v "${LIVE_DYNAMIC_DIR}:/etc/traefik/dynamic:ro" \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  traefik:v3.3 >/dev/null; then
  echo "[ERROR] 사전 검증용 컨테이너 기동 실패. ATS는 그대로 유지됩니다."
  exit 1
fi

PROBE_OK=false
for i in $(seq 1 15); do
  PROBE_CODE="$(http_code "$SERVICE_HOST" "https://127.0.0.1:18443/")"
  if [ "$PROBE_CODE" = "200" ]; then
    PROBE_OK=true
    echo "[OK] 사전 검증 통과: ${SERVICE_HOST} -> 200 (${i}/15)"
    break
  fi
  sleep 2
done

if [ "$PROBE_OK" = false ]; then
  echo "[ERROR] 사전 검증 실패 (마지막 응답: ${PROBE_CODE:-없음})."
  echo "        Traefik 설정이나 백엔드 연결에 문제가 있습니다."
  echo "        ATS는 그대로 살아 있으므로 서비스 영향은 없습니다."
  echo ""
  echo "--- file provider 기동 여부 (없으면 정적 설정을 못 읽은 것) ---"
  docker logs "$PROBE_NAME" 2>&1 | grep -i "provider\|error\|entryPoint" | head -20 || true
  echo "--- 전체 로그 (마지막 40줄) ---"
  docker logs --tail 40 "$PROBE_NAME" 2>&1 || true
  echo "--- 마운트 확인 (traefik.yaml이 파일로 잡혔는지) ---"
  docker exec "$PROBE_NAME" sh -c 'ls -la /etc/traefik/traefik.yaml /etc/traefik/dynamic/ 2>&1' || true
  docker rm -f "$PROBE_NAME" >/dev/null 2>&1 || true
  exit 1
fi
docker rm -f "$PROBE_NAME" >/dev/null 2>&1 || true

# ---------------------------------------------------------------------------
# 6. 여기서부터 다운타임: ATS 정지 -> Traefik 기동
# ---------------------------------------------------------------------------
if [ "${MIGRATE_YES:-}" != "1" ]; then
  echo ""
  echo "여기서부터 수초의 다운타임이 발생합니다 (ATS 정지 -> Traefik 기동)."
  echo "실패하면 자동으로 ATS를 되살립니다."
  printf "계속하려면 yes 를 입력하세요: "
  read -r CONFIRM
  if [ "$CONFIRM" != "yes" ]; then
    echo "[INFO] 취소했습니다. ATS는 그대로 실행 중입니다."
    exit 0
  fi
fi

echo "[7/9] ATS 정지 (다운타임 시작)..."
# rm이 아니라 stop이다. 컨테이너와 설정을 남겨두면 docker start 한 번으로 롤백된다.
docker stop kokomen-ats || true

echo "[8/9] Traefik 기동..."
# --force-recreate: 이전 실행에서 남은 컨테이너를 재사용하면 그때의 정의(포트/마운트
# 누락 등)를 그대로 물고 뜬다. 실제로 포트가 퍼블리시되지 않는 사고가 있었다.
if ! docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --force-recreate traefik; then
  echo "[ERROR] Traefik 기동 실패"
  restore_ats || true
  exit 1
fi

# 포트가 실제로 퍼블리시됐는지 확인한다. compose가 성공해도 재사용된 컨테이너면
# 포트 바인딩이 없을 수 있고, 그러면 호스트에서 아무도 접속하지 못한다.
if ! docker port kokomen-traefik 2>/dev/null | grep -q '^80/tcp'; then
  echo "[ERROR] Traefik에 80 포트가 퍼블리시되지 않았습니다"
  echo "--- docker port 출력 ---"
  docker port kokomen-traefik || echo "(없음)"
  restore_ats || true
  exit 1
fi
echo "[OK] 포트 퍼블리시 확인: $(docker port kokomen-traefik | tr '\n' ' ')"

TRAEFIK_OK=false
for i in $(seq 1 20); do
  if docker exec kokomen-traefik traefik healthcheck --ping >/dev/null 2>&1; then
    TRAEFIK_OK=true
    echo "[OK] Traefik 기동 완료 (${i}/20)"
    break
  fi
  sleep 2
done

if [ "$TRAEFIK_OK" = false ]; then
  echo "[ERROR] Traefik 헬스체크 실패"
  docker logs --tail 80 kokomen-traefik || true
  restore_ats || true
  exit 1
fi

# ---------------------------------------------------------------------------
# 7. 검증
# ---------------------------------------------------------------------------
echo "[9/9] 라우팅 검증..."
FAILED=""

# Traefik이 리스너를 열고 동적 설정을 읽을 시간을 준다.
# 000(연결 실패)은 아직 준비 안 된 상태일 수 있어 재시도한다.
check() {
  local label="$1" host="$2" expect="$3" url="$4"
  local code=""
  for _ in $(seq 1 10); do
    code="$(http_code "$host" "$url")"
    [ "$code" = "$expect" ] && break
    sleep 2
  done
  if [ "$code" = "$expect" ]; then
    echo "  [OK]   ${label}: ${code}"
  else
    if [ "$code" = "000" ] || [ -z "$code" ]; then
      echo "  [FAIL] ${label}: 연결 실패 (HTTP 응답 없음, 기대값 ${expect})"
    else
      echo "  [FAIL] ${label}: ${code} (기대값 ${expect})"
    fi
    FAILED="yes"
  fi
}

check "${SERVICE_HOST} (HTTPS)"       "$SERVICE_HOST" "200" "https://127.0.0.1/"
check "${SERVICE_HOST} HTTP 리다이렉트" "$SERVICE_HOST" "301" "http://127.0.0.1/"

# ACME 챌린지 경로는 HTTPS로 리다이렉트되지 않아야 한다.
# 파일이 없어 404가 나는 건 정상이지만, 응답 자체가 없으면(000) 확인이 안 된 것이므로 실패로 본다.
# (ATS에서는 이 경로가 301로 넘어가서 webroot 갱신이 불가능했다. 여기서 고쳐진다)
ACME_CODE="$(http_code "$SERVICE_HOST" "http://127.0.0.1/.well-known/acme-challenge/migration-probe")"
if [ "$ACME_CODE" = "301" ] || [ "$ACME_CODE" = "308" ]; then
  echo "  [FAIL] ACME 챌린지가 HTTPS로 리다이렉트됩니다 (${ACME_CODE}). 인증서 갱신이 깨집니다."
  FAILED="yes"
elif [ "$ACME_CODE" = "000" ] || [ -z "$ACME_CODE" ]; then
  echo "  [FAIL] ACME 챌린지 경로 확인 실패 (응답 없음)"
  FAILED="yes"
else
  echo "  [OK]   ACME 챌린지 경로 리다이렉트 안 됨: ${ACME_CODE}"
fi

if [ -n "$FAILED" ]; then
  echo ""
  echo "===== 진단 정보 ====="
  echo "--- traefik 컨테이너 상태 ---"
  docker ps -a --filter "name=kokomen-traefik" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || true
  echo "--- 퍼블리시된 포트 ---"
  docker port kokomen-traefik || true
  echo "--- 호스트에서 80/443 리스닝 여부 ---"
  (ss -ltnp 2>/dev/null || netstat -ltnp 2>/dev/null) | grep -E ':(80|443)\s' || echo "(80/443 리스너 없음)"
  echo "--- traefik 로그 (마지막 60줄) ---"
  docker logs --tail 60 kokomen-traefik 2>&1 || true
  echo "--- HTTP 요청 상세 ---"
  curl -sv --max-time 5 -o /dev/null -H "Host: ${SERVICE_HOST}" http://127.0.0.1/ 2>&1 | tail -15 || true
  echo "====================="
  echo ""
  echo "[ERROR] 검증 실패 -> ATS로 롤백합니다."
  restore_ats || true
  echo "[ROLLBACK] 위 진단 정보를 확인하세요."
  exit 1
fi

# ---------------------------------------------------------------------------
# 8. 마무리
# ---------------------------------------------------------------------------
echo ""
echo "========================================="
echo " 마이그레이션 완료 (활성: $ACTIVE_COLOR)"
echo "========================================="
docker ps --filter "name=kokomen-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "ATS 컨테이너는 정지 상태로 남겨뒀습니다(롤백용). 안정화되면 제거하세요."
echo ""
echo "다음 순서로 마무리하세요."
echo "  1) .github/workflows/deploy.yml 의 배포 스크립트를"
echo "     ./scripts/blue-green-deploy.sh -> ./scripts/blue-green-deploy-prod.sh 로 변경"
echo "  2) 인증서 갱신 훅 등록 (갱신된 pem을 Traefik이 다시 읽게 만든다)"
echo "     sudo TRAEFIK_CONFIG_DIR=$LIVE_CONFIG_DIR ./scripts/traefik-cert-reload-hook.sh --install"
echo "  3) certbot renew --dry-run 으로 무중단 갱신 확인"
echo ""
echo "롤백이 필요하면:"
echo "  docker compose --env-file $ENV_FILE -f $COMPOSE_FILE stop traefik"
echo "  docker start kokomen-ats"
