import { Suspense } from "react";
import { LocalizedContent } from "@venuecms/sdk";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { EventsSkeleton } from "./LoadingSkeletons";
import { EventsError } from "./ErrorFallbacks";
import { EventsContent } from "./EventsContent";

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
        <EventsContent locale={locale} siteContent={siteContent} />
      </Suspense>
    </ErrorBoundary>
  );
}
