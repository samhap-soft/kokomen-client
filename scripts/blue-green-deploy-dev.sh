#!/bin/bash
set -euo pipefail

# Blue-Green 무중단 배포 스크립트 (Dev, Traefik file provider)
# 사용법: ./scripts/blue-green-deploy-dev.sh [.env]
#
# ATS 방식과의 차이:
#   - sed 템플릿 렌더 + docker cp + traffic_ctl reload  →  파일 rename 한 번
#   - "지금 트래픽을 받는 쪽"의 기준이 docker ps가 아니라 라우팅 파일이다.
#     그래서 새 색을 미리 띄워도 트래픽이 가지 않고, 전환이 원자적이다.
#
# 설정 파일 위치가 두 곳인 이유:
#   REPO_*  = git이 관리하는 소스. actions/checkout이 매번 되돌린다.
#   LIVE_*  = 실제로 Traefik에 마운트되는 호스트 경로. checkout이 건드리지 않는다.
#   매 배포마다 REPO -> LIVE로 동기화하되, client.yaml의 활성 색상만 LIVE 값을 보존한다.

ENV_FILE="${1:-.env}"
COMPOSE_FILE="./docker/client/compose.dev.yaml"

REPO_CONFIG_DIR="./traefik/dev"
LIVE_CONFIG_DIR="${TRAEFIK_CONFIG_DIR:-/opt/kokomen/traefik/dev}"
LIVE_DYNAMIC_DIR="${LIVE_CONFIG_DIR}/dynamic"
LIVE_ROUTE_FILE="${LIVE_DYNAMIC_DIR}/client.yaml"
REPO_ROUTE_FILE="${REPO_CONFIG_DIR}/dynamic/client.yaml"

# Traefik이 파일 변경을 감지하고 반영할 여유
TRAEFIK_RELOAD_WAIT=3

# compose가 이미지 이름을 보간할 때 쓰는 값.
# CI에서는 워크플로우가 셸 환경으로 주입하지만 수동 실행 시에는 비어 있어서,
# 이미지가 "/kokomen-client:development"가 되고 invalid reference format으로 죽는다.
if [ -z "${DOCKER_USERNAME:-}" ] && [ -f "$ENV_FILE" ]; then
  DOCKER_USERNAME="$(sed -n 's/^DOCKER_USERNAME=//p' "$ENV_FILE" | tail -1 | tr -d '"'"'"'')"
  export DOCKER_USERNAME
fi
if [ -z "${DOCKER_USERNAME:-}" ]; then
  echo "[ERROR] DOCKER_USERNAME이 설정되지 않았습니다."
  echo "        DOCKER_USERNAME=<도커허브계정> $0 $ENV_FILE 형태로 실행하거나"
  echo "        $ENV_FILE 에 DOCKER_USERNAME=<도커허브계정> 을 추가하세요."
  exit 1
fi

echo "========================================="
echo " Blue-Green Deploy: Dev (Traefik)"
echo "========================================="
echo "[INFO] 라이브 설정 경로: $LIVE_CONFIG_DIR"

# ---------------------------------------------------------------------------
# 0. 설정 동기화 (REPO -> LIVE)
# ---------------------------------------------------------------------------
if [ ! -d "$LIVE_DYNAMIC_DIR" ]; then
  echo "[ERROR] 라이브 설정 디렉토리가 없습니다: $LIVE_DYNAMIC_DIR"
  echo "        최초 1회 ./scripts/migrate-nginx-to-traefik-dev.sh 를 먼저 실행하세요."
  exit 1
fi

# 쓰기 권한을 컨테이너를 건드리기 전에 확인한다.
# 마이그레이션을 sudo로 돌리면 이 경로가 root 소유가 되어, 배포 유저가
# 트래픽 전환 시점에야 Permission denied로 실패한다(컨테이너는 이미 떠 있는 상태).
if [ ! -w "$LIVE_DYNAMIC_DIR" ] || [ ! -w "$LIVE_CONFIG_DIR" ]; then
  echo "[ERROR] 라이브 설정 경로에 쓸 수 없습니다: $LIVE_CONFIG_DIR"
  DIR_OWNER="$(stat -c '%U:%G' "$LIVE_CONFIG_DIR" 2>/dev/null \
    || stat -f '%Su:%Sg' "$LIVE_CONFIG_DIR" 2>/dev/null \
    || ls -ld "$LIVE_CONFIG_DIR" 2>/dev/null | awk '{print $3":"$4}')"
  echo "        현재 유저: $(id -un) / 디렉토리 소유자: ${DIR_OWNER:-확인 불가}"
  echo ""
  echo "        호스트에서 한 번 실행해 소유권을 배포 유저로 넘기세요:"
  echo "          sudo chown -R $(id -un):$(id -gn) $LIVE_CONFIG_DIR"
  exit 1
fi

# 정적 설정: 변경되면 Traefik 재시작이 필요하다
NEEDS_TRAEFIK_RESTART=false
if ! cmp -s "${REPO_CONFIG_DIR}/traefik.yaml" "${LIVE_CONFIG_DIR}/traefik.yaml"; then
  echo "[INFO] 정적 설정(traefik.yaml) 변경 감지 -> 동기화 후 재시작 예정"
  cp "${REPO_CONFIG_DIR}/traefik.yaml" "${LIVE_CONFIG_DIR}/traefik.yaml"
  NEEDS_TRAEFIK_RESTART=true
fi

# 동적 설정: client.yaml은 활성 색상을 담고 있으므로 아래에서 따로 처리한다
for f in "${REPO_CONFIG_DIR}"/dynamic/*.yaml; do
  base="$(basename "$f")"
  [ "$base" = "client.yaml" ] && continue
  if ! cmp -s "$f" "${LIVE_DYNAMIC_DIR}/${base}"; then
    echo "[INFO] 동적 설정 동기화: $base"
    tmp="${LIVE_DYNAMIC_DIR}/.${base}.tmp"
    cp "$f" "$tmp"
    mv "$tmp" "${LIVE_DYNAMIC_DIR}/${base}"
  fi
done

# ---------------------------------------------------------------------------
# 1. 현재 활성 색상 판별 (라이브 라우팅 파일이 유일한 진실)
# ---------------------------------------------------------------------------
ACTIVE_SERVICE="$(awk '/^[[:space:]]+service:[[:space:]]*client-(blue|green)/ {print $2; exit}' "$LIVE_ROUTE_FILE")"
if [ -z "$ACTIVE_SERVICE" ]; then
  echo "[ERROR] $LIVE_ROUTE_FILE 에서 활성 service를 찾지 못했습니다."
  exit 1
fi
CURRENT_COLOR="${ACTIVE_SERVICE#client-}"
echo "[INFO] 라우팅 파일 기준 현재 활성: $CURRENT_COLOR"

if docker ps --format '{{.Names}}' | grep -qx "kokomen-client-${CURRENT_COLOR}"; then
  if [ "$CURRENT_COLOR" = "blue" ]; then
    NEW_COLOR="green"
  else
    NEW_COLOR="blue"
  fi
  IS_FIRST_DEPLOY=false
  echo "[INFO] 교대 배포: $CURRENT_COLOR -> $NEW_COLOR"
else
  # 활성 색상이 안 떠 있으면 지금 트래픽을 받는 대상이 없는 상태(최초 배포 또는 장애).
  # 색을 바꾸지 않고 활성 색상 그대로 올린다.
  NEW_COLOR="$CURRENT_COLOR"
  IS_FIRST_DEPLOY=true
  echo "[INFO] 활성 색상($CURRENT_COLOR) 컨테이너가 없습니다. $NEW_COLOR 로 배포합니다."
fi

NEW_SERVICE="client-${NEW_COLOR}"
NEW_CONTAINER="kokomen-client-${NEW_COLOR}"
OLD_CONTAINER="kokomen-client-${CURRENT_COLOR}"

# ---------------------------------------------------------------------------
# 2. 프록시 / 챌린지 컨테이너 기동
# ---------------------------------------------------------------------------
for svc in traefik certbot-webroot; do
  cname="kokomen-${svc}"
  if ! docker ps --format '{{.Names}}' | grep -qx "$cname"; then
    echo "[INFO] $cname 시작..."
    # --force-recreate: 남아 있던 컨테이너를 재사용하면 그때의 정의(포트/마운트 누락)를
    # 그대로 물고 떠서 호스트에서 접속이 안 되는 사고가 있었다.
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --force-recreate "$svc"
    NEEDS_TRAEFIK_RESTART=false
  fi
done

# Traefik이 80/443을 실제로 물고 있는지 확인 (compose 성공만으로는 보장되지 않는다)
if ! docker port kokomen-traefik 2>/dev/null | grep -q '^80/tcp'; then
  echo "[ERROR] Traefik에 80 포트가 퍼블리시되지 않았습니다. 배포를 중단합니다."
  echo "--- docker port 출력 ---"
  docker port kokomen-traefik || echo "(없음)"
  echo "        다음으로 복구하세요:"
  echo "          docker compose --env-file $ENV_FILE -f $COMPOSE_FILE up -d --force-recreate traefik"
  exit 1
fi

if [ "$NEEDS_TRAEFIK_RESTART" = true ]; then
  echo "[INFO] Traefik 재시작 (정적 설정 변경 반영)..."
  docker restart kokomen-traefik
fi

echo "[INFO] Traefik 헬스체크 대기..."
for i in $(seq 1 15); do
  if docker exec kokomen-traefik traefik healthcheck --ping >/dev/null 2>&1; then
    echo "[OK] Traefik 준비 완료 (${i}/15)"
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo "[ERROR] Traefik이 응답하지 않습니다. 배포 중단."
    docker logs --tail 50 kokomen-traefik || true
    exit 1
  fi
  sleep 2
done

# ---------------------------------------------------------------------------
# 3. 새 색상 컨테이너 기동 (라우터가 가리키지 않으므로 트래픽 0)
# ---------------------------------------------------------------------------
echo "[INFO] $NEW_CONTAINER 시작..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile "$NEW_COLOR" up -d "client-${NEW_COLOR}"

echo "[INFO] $NEW_CONTAINER 헬스체크 대기..."
MAX_RETRIES=30
RETRY_INTERVAL=2
for i in $(seq 1 $MAX_RETRIES); do
  if docker exec "$NEW_CONTAINER" wget -q --spider http://localhost:3000/ 2>/dev/null; then
    echo "[OK] $NEW_CONTAINER 헬스체크 통과 (${i}/${MAX_RETRIES})"
    break
  fi
  if [ "$i" -eq "$MAX_RETRIES" ]; then
    echo "[ERROR] $NEW_CONTAINER 헬스체크 실패. 배포 중단(트래픽은 그대로 $CURRENT_COLOR)."
    docker logs --tail 50 "$NEW_CONTAINER" || true
    if [ "$IS_FIRST_DEPLOY" = false ]; then
      docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile "$NEW_COLOR" stop "client-${NEW_COLOR}" || true
      docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile "$NEW_COLOR" rm -f "client-${NEW_COLOR}" || true
    fi
    exit 1
  fi
  echo "[WAIT] 헬스체크 재시도... (${i}/${MAX_RETRIES})"
  sleep $RETRY_INTERVAL
done

# ---------------------------------------------------------------------------
# 4. 트래픽 전환 — 리포의 client.yaml을 새 색상으로 렌더해서 원자적으로 교체
#    (리포 쪽 라우터/미들웨어 변경도 같이 반영된다)
#    in-place 편집(sed -i)을 쓰면 Traefik이 반쯤 쓰인 파일을 읽을 수 있으므로
#    반드시 temp 파일 -> rename 순서로 한다.
#    temp/backup은 Traefik이 감시하는 dynamic/ 밖에 둔다(같은 파일시스템이므로
#    rename은 그대로 원자적이고, Traefik이 중간 파일을 볼 일이 없다).
# ---------------------------------------------------------------------------
echo "[INFO] 트래픽 전환: $ACTIVE_SERVICE -> $NEW_SERVICE"
BAK_FILE="${LIVE_CONFIG_DIR}/.client.yaml.bak"
TMP_FILE="${LIVE_CONFIG_DIR}/.client.yaml.tmp"
cp "$LIVE_ROUTE_FILE" "$BAK_FILE"
# 구분자로 |를 쓰면 정규식의 (blue|green) 때문에 패턴이 조기 종료된다. /를 쓴다.
sed -E "s/^([[:space:]]*)service:[[:space:]]*client-(blue|green)[[:space:]]*$/\1service: ${NEW_SERVICE}/" \
  "$REPO_ROUTE_FILE" > "$TMP_FILE"

if ! grep -qE "^[[:space:]]+service:[[:space:]]*${NEW_SERVICE}[[:space:]]*$" "$TMP_FILE"; then
  echo "[ERROR] 라우팅 파일 렌더 실패. 전환하지 않습니다."
  rm -f "$TMP_FILE" "$BAK_FILE"
  exit 1
fi

mv "$TMP_FILE" "$LIVE_ROUTE_FILE"
echo "[OK] 라우팅 파일 교체 완료"

# ---------------------------------------------------------------------------
# 5. 전환 검증 — Traefik을 통해 실제로 응답이 오는지 확인
#    Host 헤더를 지정해 로컬 443으로 찔러본다.
#    SNI가 localhost라 인증서가 안 맞으므로 -k 를 쓴다(라우팅은 Host 헤더로 결정됨).
# ---------------------------------------------------------------------------
echo "[INFO] Traefik 반영 대기 (${TRAEFIK_RELOAD_WAIT}초)..."
sleep "$TRAEFIK_RELOAD_WAIT"

echo "[INFO] 전환 검증..."
SMOKE_OK=false
for i in $(seq 1 10); do
  # localhost는 ::1로 먼저 해석될 수 있고 Docker 퍼블리시는 기본 IPv4라 127.0.0.1을 명시한다
  if curl -skf -o /dev/null --max-time 5 -H "Host: dev.kokomen.kr" https://127.0.0.1/ 2>/dev/null; then
    SMOKE_OK=true
    echo "[OK] dev.kokomen.kr 응답 정상 (${i}/10)"
    break
  fi
  echo "[WAIT] 검증 재시도... (${i}/10)"
  sleep 2
done

if [ "$SMOKE_OK" = false ]; then
  echo "[ERROR] 전환 후 응답 검증 실패."
  if [ "$IS_FIRST_DEPLOY" = false ]; then
    echo "[ROLLBACK] 라우팅을 $ACTIVE_SERVICE 로 되돌립니다."
    mv "$BAK_FILE" "$LIVE_ROUTE_FILE"
    sleep "$TRAEFIK_RELOAD_WAIT"
    echo "[ROLLBACK] 트래픽이 $CURRENT_COLOR 로 복구되었습니다. 새 컨테이너는 조사용으로 남겨둡니다."
  fi
  docker logs --tail 50 kokomen-traefik || true
  exit 1
fi

rm -f "$BAK_FILE"

# ---------------------------------------------------------------------------
# 6. 이전 색상 정리
# ---------------------------------------------------------------------------
if [ "$IS_FIRST_DEPLOY" = false ]; then
  echo "[INFO] 이전 컨테이너 정리: $OLD_CONTAINER"
  # 전환 직전에 들어온 요청이 끝날 시간을 준다
  sleep 5
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile "$CURRENT_COLOR" stop "client-${CURRENT_COLOR}" || true
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile "$CURRENT_COLOR" rm -f "client-${CURRENT_COLOR}" || true
  echo "[OK] $OLD_CONTAINER 제거 완료"
fi

echo ""
echo "========================================="
echo " 배포 완료: $NEW_COLOR 활성"
echo "========================================="
docker ps --filter "name=kokomen-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
