#!/bin/bash
set -euo pipefail

# Nginx -> Traefik 최초 마이그레이션 스크립트 (Dev, 1회성)
# 사용법: ./scripts/migrate-nginx-to-traefik-dev.sh [.env]
#
# nginx와 Traefik은 둘 다 80/443을 쓰므로 동시에 띄울 수 없다.
# 따라서 이 스크립트에는 nginx 정지 ~ Traefik 기동 사이 수초의 다운타임이 있다.
# (dev라 감수하고, prod는 이 스크립트로 검증한 뒤 별도로 진행한다)
#
# 실패하면 Traefik을 내리고 nginx를 다시 올려 원복한다.

ENV_FILE="${1:-.env}"
COMPOSE_FILE="./docker/client/compose.dev.yaml"
NGINX_COMPOSE_BACKUP="/opt/kokomen/rollback/compose.dev.nginx.yaml"

REPO_CONFIG_DIR="./traefik/dev"
LIVE_CONFIG_DIR="${TRAEFIK_CONFIG_DIR:-/opt/kokomen/traefik/dev}"
LIVE_DYNAMIC_DIR="${LIVE_CONFIG_DIR}/dynamic"

# compose가 이미지 이름을 보간할 때 쓰는 값.
# CI에서는 워크플로우가 셸 환경으로 주입하지만 수동 실행 시에는 비어 있어서,
# 이미지가 "/kokomen-client:development"가 되고 invalid reference format으로 죽는다.
# ENV_FILE에 값이 있으면 그걸 쓰고, 없으면 여기서 멈춘다.
if [ -z "${DOCKER_USERNAME:-}" ] && [ -f "$ENV_FILE" ]; then
  DOCKER_USERNAME="$(sed -n 's/^DOCKER_USERNAME=//p' "$ENV_FILE" | tail -1 | tr -d '"'"'"'')"
  export DOCKER_USERNAME
fi
if [ -z "${DOCKER_USERNAME:-}" ]; then
  echo "[ERROR] DOCKER_USERNAME이 설정되지 않았습니다."
  echo "        이 값이 없으면 이미지 이름이 '/kokomen-client:development'가 되어 실패합니다."
  echo ""
  echo "        해결 방법 중 하나:"
  echo "          DOCKER_USERNAME=<도커허브계정> $0 $ENV_FILE"
  echo "          또는 $ENV_FILE 에 DOCKER_USERNAME=<도커허브계정> 추가"
  exit 1
fi

echo "========================================="
echo " Nginx -> Traefik 마이그레이션: Dev"
echo "========================================="
echo "[INFO] DOCKER_USERNAME=$DOCKER_USERNAME"

# ---------------------------------------------------------------------------
# 1. 사전 점검
# ---------------------------------------------------------------------------
echo "[1/8] 사전 점검..."

for domain in dev.kokomen.kr api-dev.kokomen.kr; do
  for f in fullchain.pem privkey.pem; do
    if [ ! -f "/etc/letsencrypt/live/${domain}/${f}" ]; then
      echo "[ERROR] 인증서 없음: /etc/letsencrypt/live/${domain}/${f}"
      exit 1
    fi
  done
done
echo "[OK] 인증서 확인"

if [ ! -d /var/www/certbot ]; then
  echo "[ERROR] certbot webroot 없음: /var/www/certbot"
  exit 1
fi
echo "[OK] certbot webroot 확인"

if ! docker network inspect dev-kokomen-net >/dev/null 2>&1; then
  echo "[ERROR] docker network 없음: dev-kokomen-net"
  exit 1
fi
echo "[OK] docker network 확인"

# ---------------------------------------------------------------------------
# 2. 라이브 설정 디렉토리 생성 (리포 밖 — checkout이 건드리지 못하는 곳)
# ---------------------------------------------------------------------------
echo "[2/8] 라이브 설정 디렉토리 준비: $LIVE_CONFIG_DIR"
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
echo "[OK] 설정 복사 완료 (활성 색상: blue)"

# ---------------------------------------------------------------------------
# 3. 롤백용 nginx compose 백업
# ---------------------------------------------------------------------------
echo "[3/8] 롤백용 nginx compose 백업..."
mkdir -p "$(dirname "$NGINX_COMPOSE_BACKUP")"
if [ ! -f "$NGINX_COMPOSE_BACKUP" ]; then
  cat > "$NGINX_COMPOSE_BACKUP" <<'EOF'
# 롤백 전용: Traefik 도입 이전의 dev 구성
# 사용법: docker compose --env-file .env -f /opt/kokomen/rollback/compose.dev.nginx.yaml up -d
services:
  client:
    image: ${DOCKER_USERNAME}/kokomen-client:development
    container_name: kokomen-client
    expose:
      - "3000"
    restart: always
    networks:
      - dev-kokomen-net

  nginx:
    image: nginx:latest
    container_name: kokomen-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /opt/kokomen/rollback/nginx.dev.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/www/certbot:/var/www/certbot
    depends_on:
      - client
    restart: always
    networks:
      - dev-kokomen-net

networks:
  dev-kokomen-net:
    external: true
    driver: bridge
EOF
fi
cp ./nginx/nginx.dev.conf /opt/kokomen/rollback/nginx.dev.conf
echo "[OK] 롤백 자료 준비: $NGINX_COMPOSE_BACKUP"

# ---------------------------------------------------------------------------
# 4. client-blue 먼저 기동 (포트를 쓰지 않으므로 nginx와 공존 가능)
# ---------------------------------------------------------------------------
echo "[4/8] client-blue 기동..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile blue up -d client-blue

echo "[5/8] client-blue 헬스체크 대기..."
for i in $(seq 1 30); do
  if docker exec kokomen-client-blue wget -q --spider http://localhost:3000/ 2>/dev/null; then
    echo "[OK] client-blue 준비 완료 (${i}/30)"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "[ERROR] client-blue 헬스체크 실패. 기존 nginx는 그대로 유지됩니다."
    docker logs --tail 50 kokomen-client-blue || true
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile blue stop client-blue || true
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile blue rm -f client-blue || true
    exit 1
  fi
  sleep 2
done

# certbot webroot도 미리 띄워둔다 (포트 미사용)
echo "[INFO] certbot-webroot 기동..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d certbot-webroot

# ---------------------------------------------------------------------------
# 4.5 사전 검증 (다운타임 없음)
#     nginx가 80/443을 쥐고 있는 동안, 같은 설정으로 대체 포트에 Traefik을 띄워
#     설정과 라우팅이 실제로 동작하는지 먼저 확인한다.
#     이걸 통과하지 못하면 다운타임을 아예 감수하지 않는다.
# ---------------------------------------------------------------------------
echo "[INFO] 사전 검증: 대체 포트(18081/18443)로 설정 확인 (다운타임 없음)..."
PROBE_NAME="kokomen-traefik-probe"
docker rm -f "$PROBE_NAME" >/dev/null 2>&1 || true
if ! docker run -d --name "$PROBE_NAME" \
  --network dev-kokomen-net \
  -p 127.0.0.1:18081:80 -p 127.0.0.1:18443:443 \
  -v "${LIVE_CONFIG_DIR}/traefik.yaml:/etc/traefik/traefik.yaml:ro" \
  -v "${LIVE_DYNAMIC_DIR}:/etc/traefik/dynamic:ro" \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  traefik:v3.3 >/dev/null; then
  echo "[ERROR] 사전 검증용 컨테이너 기동 실패. nginx는 그대로 유지됩니다."
  exit 1
fi

PROBE_OK=false
for i in $(seq 1 15); do
  PROBE_CODE="$(curl -sk -o /dev/null -w '%{http_code}' --max-time 5 \
    -H "Host: dev.kokomen.kr" "https://127.0.0.1:18443/" 2>/dev/null || true)"
  if [ "$PROBE_CODE" = "200" ]; then
    PROBE_OK=true
    echo "[OK] 사전 검증 통과: dev.kokomen.kr -> 200 (${i}/15)"
    break
  fi
  sleep 2
done

if [ "$PROBE_OK" = false ]; then
  echo "[ERROR] 사전 검증 실패 (마지막 응답: ${PROBE_CODE:-없음})."
  echo "        Traefik 설정이나 백엔드 연결에 문제가 있습니다."
  echo "        nginx는 그대로 살아 있으므로 서비스 영향은 없습니다."
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
# 5. 여기서부터 다운타임: nginx 정지 -> Traefik 기동
# ---------------------------------------------------------------------------
echo "[6/8] nginx 정지 (다운타임 시작)..."
docker stop kokomen-nginx || true

echo "[7/8] Traefik 기동..."
# --force-recreate: 이전 실행에서 남은 컨테이너를 재사용하면 그때의 정의(포트/마운트
# 누락 등)를 그대로 물고 뜬다. 실제로 포트가 퍼블리시되지 않는 사고가 있었다.
if ! docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --force-recreate traefik; then
  echo "[ERROR] Traefik 기동 실패 -> nginx 복구"
  docker start kokomen-nginx || true
  exit 1
fi

# 포트가 실제로 퍼블리시됐는지 확인한다. compose가 성공해도 재사용된 컨테이너면
# 포트 바인딩이 없을 수 있고, 그러면 호스트에서 아무도 접속하지 못한다.
if ! docker port kokomen-traefik 2>/dev/null | grep -q '^80/tcp'; then
  echo "[ERROR] Traefik에 80 포트가 퍼블리시되지 않았습니다 -> nginx 복구"
  echo "--- docker port 출력 ---"
  docker port kokomen-traefik || echo "(없음)"
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop traefik || true
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" rm -f traefik || true
  docker start kokomen-nginx || true
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
  echo "[ERROR] Traefik 헬스체크 실패 -> nginx 복구"
  docker logs --tail 80 kokomen-traefik || true
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop traefik || true
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" rm -f traefik || true
  docker start kokomen-nginx || true
  exit 1
fi

# ---------------------------------------------------------------------------
# 6. 검증
# ---------------------------------------------------------------------------
echo "[8/8] 라우팅 검증..."
FAILED=""

# curl의 http_code만 얻는다. 127.0.0.1을 명시하는 이유:
#   "localhost"는 ::1로 먼저 해석될 수 있고, Docker의 포트 퍼블리시는
#   기본적으로 IPv4(0.0.0.0)만 잡아서 연결 실패(000)로 보일 수 있다.
# 실패해도 curl이 이미 "000"을 출력하므로 `|| echo`로 덧붙이면 안 된다(000000이 된다).
http_code() {
  local host="$1" url="$2"
  curl -sk -o /dev/null -w '%{http_code}' --max-time 5 \
    -H "Host: ${host}" "$url" 2>/dev/null || true
}

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

# 프론트엔드 / API는 200, HTTP는 301 리다이렉트
check "dev.kokomen.kr (HTTPS)"     "dev.kokomen.kr"     "200" "https://127.0.0.1/"
check "api-dev HTTPS 도달"          "api-dev.kokomen.kr" "200" "https://127.0.0.1/api/v1/members/ranking"
check "dev.kokomen.kr HTTP 리다이렉트" "dev.kokomen.kr"     "301" "http://127.0.0.1/"

# ACME 챌린지 경로는 HTTPS로 리다이렉트되지 않아야 한다.
# 파일이 없어 404가 나는 건 정상이지만, 응답 자체가 없으면(000) 확인이 안 된 것이므로 실패로 본다.
ACME_CODE="$(http_code "dev.kokomen.kr" "http://127.0.0.1/.well-known/acme-challenge/migration-probe")"
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
  curl -sv --max-time 5 -o /dev/null -H "Host: dev.kokomen.kr" http://127.0.0.1/ 2>&1 | tail -15 || true
  echo "====================="
  echo ""
  echo "[ERROR] 검증 실패 -> nginx로 롤백합니다."
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop traefik || true
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" rm -f traefik || true
  docker start kokomen-nginx || true
  echo "[ROLLBACK] nginx 복구 완료. 위 진단 정보를 확인하세요."
  exit 1
fi

# ---------------------------------------------------------------------------
# 7. 마무리
# ---------------------------------------------------------------------------
echo ""
echo "[INFO] 검증 통과. 기존 nginx 컨테이너를 제거합니다."
docker rm -f kokomen-nginx || true
# 이전 단일 client 컨테이너도 정리 (blue로 대체됨)
docker rm -f kokomen-client 2>/dev/null || true

echo ""
echo "========================================="
echo " 마이그레이션 완료 (활성: blue)"
echo "========================================="
docker ps --filter "name=kokomen-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "롤백이 필요하면:"
echo "  docker compose -f $COMPOSE_FILE stop traefik"
echo "  docker compose --env-file $ENV_FILE -f $NGINX_COMPOSE_BACKUP up -d"
