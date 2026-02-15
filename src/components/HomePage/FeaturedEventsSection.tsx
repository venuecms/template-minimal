import { Suspense } from "react";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { FeaturedEventsSkeleton } from "./LoadingSkeletons";
import { FeaturedEventsError } from "./ErrorFallbacks";
import { FeaturedEventsContent } from "./FeaturedEventsContent";

export function FeaturedEventsSection({ locale }: { locale: string }) {
  return (
    <ErrorBoundary fallback={<FeaturedEventsError />}>
      <Suspense fallback={<FeaturedEventsSkeleton />}>
        <FeaturedEventsContent locale={locale} />
      </Suspense>
    </ErrorBoundary>
  );
}
