import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/interviews/$interviewId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /interviews/$interviewId/!</div>;
}
