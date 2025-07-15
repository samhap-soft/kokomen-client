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
      emit: jest.fn(),
    },
  }),
}));

import "@testing-library/jest-dom";
import { server } from "@/mocks";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

export { mockBack, mockPrefetch, mockPush, mockReload, mockReplace };
