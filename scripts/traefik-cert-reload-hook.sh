#!/bin/bash
set -euo pipefail

# 인증서 갱신 후 Traefik에 반영시키는 스크립트 (dev/prod 공용)
#
# 왜 필요한가:
#   Traefik file provider는 providers.file.directory(= dynamic/)만 감시한다.
#   certbot이 /etc/letsencrypt/live/<도메인>/*.pem 을 갱신해도 그건 감시 대상이 아니라서
#   Traefik은 기동 시 메모리에 올린 옛 인증서를 계속 서빙한다.
#   즉 갱신은 성공했는데 브라우저에는 만료된 인증서가 나가는 상황이 생긴다.
#
# 어떻게 반영하는가:
#   dynamic/tls.yaml 을 "같은 내용으로 다시 쓴다"(temp -> rename).
#   내용은 그대로지만 파일 쓰기 이벤트가 발생해 Traefik이 동적 설정을 리로드하고,
#   그 과정에서 인증서를 디스크에서 다시 읽는다. 컨테이너 재시작이 없으므로 무중단이다.
#   (배포 스크립트가 client.yaml을 교체하는 것과 정확히 같은 메커니즘)
#
# 사용법:
#   ./scripts/traefik-cert-reload-hook.sh                  # 지금 즉시 리로드
#   TRAEFIK_CONFIG_DIR=/opt/kokomen/traefik/dev ./scripts/traefik-cert-reload-hook.sh
#   sudo ./scripts/traefik-cert-reload-hook.sh --install    # certbot deploy 훅으로 등록
#
# --install 로 등록되는 훅은 이 리포에 의존하지 않는 독립 스크립트다.
# (러너가 워킹트리를 지우거나 경로가 바뀌어도 갱신이 계속 동작해야 한다)

CONTAINER="${TRAEFIK_CONTAINER:-kokomen-traefik}"
HOOK_PATH="/etc/letsencrypt/renewal-hooks/deploy/10-traefik-reload.sh"

detect_config_dir() {
  if [ -n "${TRAEFIK_CONFIG_DIR:-}" ]; then
    echo "$TRAEFIK_CONFIG_DIR"
    return
  fi
  for d in /opt/kokomen/traefik/prod /opt/kokomen/traefik/dev; do
    [ -d "${d}/dynamic" ] && echo "$d" && return
  done
  echo ""
}

reload() {
  local config_dir="$1"
  local tls_file="${config_dir}/dynamic/tls.yaml"
  local tmp_file="${config_dir}/.tls.yaml.reload.tmp"

  if [ ! -f "$tls_file" ]; then
    echo "[ERROR] tls.yaml 없음: $tls_file"
    exit 1
  fi

  # temp는 감시 디렉토리(dynamic/) 밖에 둔다. Traefik이 중간 파일을 보면
  # 라우터가 없는 설정으로 잠깐 리로드될 수 있다.
  cp "$tls_file" "$tmp_file"
  mv "$tmp_file" "$tls_file"
  echo "[OK] tls.yaml 재작성 -> Traefik 동적 설정 리로드 유발: $tls_file"

  if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
    echo "[WARN] $CONTAINER 가 실행 중이 아닙니다. 다음 기동 시 새 인증서를 읽습니다."
    return 0
  fi

  # 리로드는 비동기다. 실제로 새 인증서가 나가는지 확인해준다.
  sleep 3
  if command -v openssl >/dev/null 2>&1; then
    local host notafter
    host="$(awk -F/ '/certFile:/ {print $5; exit}' "$tls_file")"
    notafter="$(echo | openssl s_client -connect 127.0.0.1:443 -servername "${host:-localhost}" 2>/dev/null \
      | openssl x509 -noout -enddate 2>/dev/null || true)"
    if [ -n "$notafter" ]; then
      echo "[INFO] 현재 서빙 중인 인증서(${host:-?}) ${notafter}"
    fi
  fi
}

install_hook() {
  local config_dir="$1"

  if [ "$(id -u)" -ne 0 ]; then
    echo "[ERROR] --install 은 root 권한이 필요합니다. sudo로 실행하세요."
    exit 1
  fi

  mkdir -p "$(dirname "$HOOK_PATH")"
  cat > "$HOOK_PATH" <<EOF
#!/bin/bash
# certbot deploy 훅 — 인증서 갱신 시 Traefik이 새 pem을 다시 읽도록 만든다.
# scripts/traefik-cert-reload-hook.sh --install 로 생성됨. 리포에 의존하지 않는다.
set -eu

CONFIG_DIR="${config_dir}"
CONTAINER="${CONTAINER}"
TLS_FILE="\${CONFIG_DIR}/dynamic/tls.yaml"
TMP_FILE="\${CONFIG_DIR}/.tls.yaml.reload.tmp"

[ -f "\$TLS_FILE" ] || exit 0

cp "\$TLS_FILE" "\$TMP_FILE"
mv "\$TMP_FILE" "\$TLS_FILE"

logger -t traefik-cert-reload "tls.yaml rewritten to trigger Traefik reload (\$CONTAINER)" 2>/dev/null || true
EOF
  chmod +x "$HOOK_PATH"
  echo "[OK] certbot deploy 훅 등록: $HOOK_PATH"
  echo "     대상 설정 경로: $config_dir"
  echo ""
  echo "확인:"
  echo "  certbot renew --dry-run    # 훅까지 같이 돌려본다"
}

CONFIG_DIR="$(detect_config_dir)"
if [ -z "$CONFIG_DIR" ]; then
  echo "[ERROR] Traefik 라이브 설정 경로를 찾지 못했습니다."
  echo "        TRAEFIK_CONFIG_DIR=/opt/kokomen/traefik/<env> 를 지정해서 실행하세요."
  exit 1
fi

case "${1:-}" in
  --install)
    install_hook "$CONFIG_DIR"
    ;;
  "")
    reload "$CONFIG_DIR"
    ;;
  *)
    echo "사용법: $0 [--install]"
    exit 1
    ;;
esac
