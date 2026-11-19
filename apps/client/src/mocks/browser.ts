import { setupWorker } from "msw/browser";
import { systemDesignHandlers } from "@/mocks/handlers/systemDesign";

/**
 * 개발용 브라우저 목. 백엔드가 아직 없는 API(시스템 설계 면접)만 가로챈다.
 * 다른 요청은 그대로 실제 서버로 보낸다(onUnhandledRequest: "bypass").
 */
export const worker = setupWorker(...systemDesignHandlers);
