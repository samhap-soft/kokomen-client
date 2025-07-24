import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login/callback")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /login/callback!</div>;
}
