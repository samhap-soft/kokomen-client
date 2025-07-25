export * as Auth from "./auth";
export * as Interviews from "./interviews";
export * as Reports from "./reports";
export * as Members from "./members";
export * as Dashboard from "./dashboard";
type Category = {
  key: string;
  title: string;
  description: string;
  image_url: string;
};
export type { Category };
