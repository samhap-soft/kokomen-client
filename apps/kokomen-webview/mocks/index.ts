import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";

// MSW 서버 설정
export const server = setupServer();

// 전역 테스트 설정
beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
