import { getCategories } from "@/domains/categories/api";
import CreateInterviewForm from "@/domains/interviews/components/createInterviewForm";
import {
  RankCard,
  RankCardSkeleton
} from "@/domains/members/components/rankCard";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { LoadingFullScreen } from "@kokomen/ui";
import React, { Suspense } from "react";

// eslint-disable-next-line @rushstack/typedef-var
export const Route = createFileRoute("/interviews/")({
  component: RouteComponent,
  loader: getCategories,
  pendingComponent: LoadingFullScreen,
  staleTime: 1000 * 60 * 60 * 24,
  gcTime: 1000 * 60 * 60 * 24
});

function RouteComponent(): React.ReactNode {
  const categories = useLoaderData({ from: "/interviews/" });
  return (
    <div className="p-2">
      <Suspense fallback={<RankCardSkeleton />}>
        <RankCard />
      </Suspense>
      <CreateInterviewForm categories={categories} />
    </div>
  );
}
