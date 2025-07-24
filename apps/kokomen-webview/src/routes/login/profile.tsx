import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /login/profile!</div>;
}
