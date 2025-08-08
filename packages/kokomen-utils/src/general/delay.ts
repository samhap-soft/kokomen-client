const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const exponentialDelay = (count: number, ms: number = 1000) => {
  console.log(ms * Math.pow(2, count), "만큼 딜레이");
  return delay(ms * Math.pow(2, count));
};

export { delay, exponentialDelay };
