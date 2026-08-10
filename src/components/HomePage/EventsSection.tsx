import { type SearchParams } from "@venuecms/sdk-next";
import { Suspense } from "react";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { EventsError } from "./ErrorFallbacks";
import { EventsContent } from "./EventsContent";
import { EventsSkeleton } from "./LoadingSkeletons";

export function EventsSection({
  locale,
  searchParams,
}: {
  locale: string;
  /**
   * Forwarded unawaited, so the wait happens inside the Suspense boundary below
   * rather than in the home route above it.
   */
  searchParams: Promise<SearchParams>;
}) {
  return (
    <ErrorBoundary fallback={<EventsError />}>
      <Suspense fallback={<EventsSkeleton />}>
        <EventsContent locale={locale} searchParams={searchParams} />
      </Suspense>
    </ErrorBoundary>
  );
}
