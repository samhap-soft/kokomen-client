import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/interviews/$interviewId/result")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /interviews/$interviewId/result!</div>;
}
