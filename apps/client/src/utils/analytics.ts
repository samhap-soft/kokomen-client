import posthog, { CaptureResult } from "posthog-js";

interface CaptureEventProperties<
  TEvent extends string,
  TProperties extends Record<string, string>,
> {
  name: TEvent;
  properties?: TProperties;
}

type ButtonCaptureEvent =
  | "userLogout"
  | "MembersInterveiw"
  | "MemberInterviewLike"
  | "MemberDashboard";
function captureButtonEvent({
  name,
  properties,
}: CaptureEventProperties<ButtonCaptureEvent, {}>): CaptureResult | undefined {
  return posthog.capture("button clicked", {
    name,
    ...properties,
  });
}

type FormSubmitEvent =
  | "logout"
  | "startNewInterview"
  | "submitInterviewAnswer"
  | "changeNickname";
function captureFormSubmitEvent({
  name,
  properties,
}: CaptureEventProperties<FormSubmitEvent, {}>): CaptureResult | undefined {
  return posthog.capture("survey sent", {
    name,
    ...properties,
  });
}

export { captureButtonEvent, captureFormSubmitEvent };
