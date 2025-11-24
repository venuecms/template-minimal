import { LocalizedContent } from "@venuecms/sdk";
import { Suspense } from "react";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { EventsError } from "./ErrorFallbacks";
import { EventsContent } from "./EventsContent";
import { EventsSkeleton } from "./LoadingSkeletons";

export function EventsSection({
  locale,
  siteContent,
}: {
  locale: string;
  siteContent?: { content: LocalizedContent };
}) {
  return (
    <ErrorBoundary fallback={<EventsError />}>
      <Suspense fallback={<EventsSkeleton />}>
        <EventsContent siteContent={siteContent} />
      </Suspense>
    </ErrorBoundary>
  );
}
