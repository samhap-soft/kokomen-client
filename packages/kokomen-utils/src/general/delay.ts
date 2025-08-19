const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const exponentialDelay = (count: number, ms: number = 1000) => {
  return delay(ms * Math.pow(2, count));
};

export { delay, exponentialDelay };
