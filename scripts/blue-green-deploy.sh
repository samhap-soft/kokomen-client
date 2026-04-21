#!/bin/bash
set -euo pipefail

# Blue-Green 무중단 배포 스크립트 (Prod)
# 사용법: ./scripts/blue-green-deploy.sh [.env]

ENV_FILE="${1:-.env}"
COMPOSE_FILE="./docker/client/compose.yaml"
REMAP_TMPL="./trafficserver/prod/remap.config.tmpl"
REMAP_CONFIG="./trafficserver/prod/remap.config"

echo "========================================="
echo " Blue-Green Deploy: Prod"
echo "========================================="

# 1. 현재 활성 색상 확인
CURRENT_COLOR=""
if docker ps --format '{{.Names}}' | grep -q "kokomen-client-blue"; then
  CURRENT_COLOR="blue"
elif docker ps --format '{{.Names}}' | grep -q "kokomen-client-green"; then
  CURRENT_COLOR="green"
fi

if [ -z "$CURRENT_COLOR" ]; then
  # 최초 배포: blue로 시작
  NEW_COLOR="blue"
  echo "[INFO] 최초 배포 감지. blue로 시작합니다."
else
  # 교대 배포
  if [ "$CURRENT_COLOR" = "blue" ]; then
    NEW_COLOR="green"
  else
    NEW_COLOR="blue"
  fi
  echo "[INFO] 현재 활성: $CURRENT_COLOR -> 새 배포: $NEW_COLOR"
fi

NEW_CONTAINER="kokomen-client-${NEW_COLOR}"
OLD_CONTAINER="kokomen-client-${CURRENT_COLOR}"

# 2. ATS가 실행 중인지 확인, 아니면 시작
if ! docker ps --format '{{.Names}}' | grep -q "kokomen-ats"; then
  echo "[INFO] ATS 컨테이너 시작..."
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d ats
  echo "[INFO] ATS 기동 대기 (5초)..."
  sleep 5
fi

# 3. 새 색상 컨테이너 시작
echo "[INFO] $NEW_COLOR 컨테이너 시작..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile "$NEW_COLOR" up -d "client-${NEW_COLOR}"

# 4. 헬스체크: 새 컨테이너가 요청을 받을 준비가 될 때까지 대기
echo "[INFO] $NEW_CONTAINER 헬스체크 대기..."
MAX_RETRIES=30
RETRY_INTERVAL=2
for i in $(seq 1 $MAX_RETRIES); do
  if docker exec "$NEW_CONTAINER" wget -q --spider http://localhost:3000/ 2>/dev/null; then
    echo "[OK] $NEW_CONTAINER 헬스체크 통과 (${i}/${MAX_RETRIES})"
    break
  fi
  if [ "$i" -eq "$MAX_RETRIES" ]; then
    echo "[ERROR] $NEW_CONTAINER 헬스체크 실패. 배포 중단."
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile "$NEW_COLOR" stop "client-${NEW_COLOR}"
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile "$NEW_COLOR" rm -f "client-${NEW_COLOR}"
    exit 1
  fi
  echo "[WAIT] 헬스체크 재시도... (${i}/${MAX_RETRIES})"
  sleep $RETRY_INTERVAL
done

# 5. remap.config 업데이트 -> ATS 트래픽 전환
echo "[INFO] ATS remap.config 업데이트 -> $NEW_CONTAINER"
sed "s/CLIENT_BACKEND/$NEW_CONTAINER/g" "$REMAP_TMPL" > "$REMAP_CONFIG"

# 6. ATS 설정 리로드 (무중단)
echo "[INFO] ATS 설정 리로드..."
docker exec kokomen-ats traffic_ctl config reload
echo "[OK] ATS 트래픽 전환 완료: $NEW_CONTAINER"

# 7. 이전 컨테이너 정리
if [ -n "$CURRENT_COLOR" ]; then
  echo "[INFO] 이전 컨테이너 정리: $OLD_CONTAINER"
  # 진행 중인 요청이 완료되도록 잠시 대기
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
