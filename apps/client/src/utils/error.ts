/* eslint-disable no-unused-vars */
import { captureException } from "@sentry/nextjs";
import { AxiosError } from "axios";

function withApiErrorCapture<T extends any[], R>(
  errorHandler: (error: Error | AxiosError, ...args: T) => R
): (error: Error | AxiosError, ...args: T) => R {
  return (error: Error | AxiosError, ...args: T) => {
    captureException(error, {
      level: "error",
      tags: {
        errorType: error instanceof AxiosError ? "AxiosError" : error.name
      }
    });
    return errorHandler(error, ...args);
  };
}

export { withApiErrorCapture };
