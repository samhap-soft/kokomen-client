import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/interviews/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /interviews/!</div>;
}
