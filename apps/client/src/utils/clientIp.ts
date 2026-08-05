import { IncomingMessage } from "http";

/**
 * 리버스 프록시 뒤에서 실제 클라이언트 IP를 얻는다.
 *
 * 프록시마다 넣어주는 헤더가 달라서 한 곳에서만 판단하도록 모아둔다.
 * - nginx / ATS: X-Real-IP 와 X-Forwarded-For 를 모두 세팅
 * - Traefik: X-Forwarded-For 만 세팅 (X-Real-IP를 붙이지 않는다)
 *
 * X-Forwarded-For 는 "client, proxy1, proxy2" 형태로 쌓일 수 있어 첫 값을 쓴다.
 * (ATS는 클라이언트 IP 하나로 덮어쓰지만, Traefik은 뒤에 덧붙인다)
 */
export function getClientIp(req: IncomingMessage): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  const firstForwarded = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor;

  return (
    firstForwarded?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.socket.remoteAddress ||
    ""
  );
}
