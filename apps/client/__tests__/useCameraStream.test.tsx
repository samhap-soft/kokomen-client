import { useCameraStream } from "@/domains/interview/hooks/useCameraStream";
import { act, renderHook } from "@testing-library/react";

type Deferred = {
  promise: Promise<MediaStream>;
  resolve: (stream: MediaStream) => void;
};

const createDeferred = (): Deferred => {
  let resolve: Deferred["resolve"] = () => {};
  const promise = new Promise<MediaStream>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const createStream = (): { stream: MediaStream; stopTrack: jest.Mock } => {
  const stopTrack = jest.fn();
  const stream = {
    getTracks: () => [{ stop: stopTrack }]
  } as unknown as MediaStream;
  return { stream, stopTrack };
};

describe("useCameraStream", () => {
  const getUserMedia = jest.fn();

  beforeEach(() => {
    getUserMedia.mockReset();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia }
    });
  });

  it("권한 창이 떠 있는 동안 화면을 떠나면, 늦게 열린 카메라를 바로 끈다", async () => {
    const deferred = createDeferred();
    getUserMedia.mockReturnValue(deferred.promise);
    const { stream, stopTrack } = createStream();

    const { result, unmount } = renderHook(() => useCameraStream());
    let pending: Promise<unknown> = Promise.resolve();
    act(() => {
      pending = result.current.start();
    });
    unmount();

    await act(async () => {
      deferred.resolve(stream);
      await pending;
    });

    expect(stopTrack).toHaveBeenCalledTimes(1);
  });

  it("켜는 중에 다시 켜도 카메라를 한 번만 요청한다", async () => {
    const deferred = createDeferred();
    getUserMedia.mockReturnValue(deferred.promise);
    const { stream, stopTrack } = createStream();

    const { result } = renderHook(() => useCameraStream());
    let first: Promise<unknown> = Promise.resolve();
    let second: Promise<unknown> = Promise.resolve();
    act(() => {
      first = result.current.start();
      second = result.current.start();
    });

    await act(async () => {
      deferred.resolve(stream);
      await Promise.all([first, second]);
    });

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(result.current.isOn).toBe(true);
    expect(stopTrack).not.toHaveBeenCalled();
  });
});
