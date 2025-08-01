const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();
const mockBack = jest.fn();
const mockReload = jest.fn();

jest.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    back: mockBack,
    reload: mockReload,
    pathname: "/",
    route: "/",
    asPath: "/",
    query: {},
    basePath: "",
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
    isFallback: false,
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    }
  })
}));

import "@testing-library/jest-dom";
import { server } from "@/mocks";

class MockIntersectionObserver {
  private viewPort: Element | null;
  private entries: IntersectionObserverEntry[];
  private callback: IntersectionObserverCallback;

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    this.callback = callback;
    this.viewPort = options?.root as Element | null;
    this.entries = [];

    // viewPort가 있는 경우에만 scroll 이벤트 리스너 추가
    if (this.viewPort) {
      this.viewPort.addEventListener("scroll", () => {
        this.entries = this.entries.map((entry) => ({
          ...entry,
          isIntersecting: true
        }));
        this.callback(this.entries, this as unknown as IntersectionObserver);
      });
    }
  }

  private isInViewPort(): boolean {
    return true; // 테스트 목적으로 항상 true 반환
  }

  observe(target: Element): void {
    const entry: IntersectionObserverEntry = {
      isIntersecting: false,
      target,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: 0,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now()
    };
    this.entries.push(entry);
  }

  unobserve(target: Element): void {
    this.entries = this.entries.filter((entry) => entry.target !== target);
  }

  disconnect(): void {
    this.entries = [];
  }
}

global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
});
afterAll(async () => {
  server.close();
  await new Promise((resolve) => setTimeout(resolve, 1000));
});

export { mockBack, mockPrefetch, mockPush, mockReload, mockReplace };
