import { OnboardingSurveyPayload } from "@kokomen/types";
import axios, { AxiosInstance, AxiosPromise } from "axios";

const onboardingInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 10000
});

/** POST /api/v1/members/me/onboarding-survey */
const submitOnboardingSurvey = (
  payload: OnboardingSurveyPayload
): AxiosPromise<void> => {
  return onboardingInstance.post("/members/me/onboarding-survey", payload);
};

export { submitOnboardingSurvey };
