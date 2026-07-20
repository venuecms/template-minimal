import { Suspense } from "react";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { NewsError } from "./ErrorFallbacks";
import { NewsSkeleton } from "./LoadingSkeletons";
import { NewsContent } from "./NewsContent";

export function NewsSection({ title }: { title?: string }) {
  return (
    <ErrorBoundary fallback={<NewsError />}>
      <Suspense fallback={<NewsSkeleton />}>
        <NewsContent title={title} />
      </Suspense>
    </ErrorBoundary>
  );
}
