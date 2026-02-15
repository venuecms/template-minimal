import { Suspense } from "react";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { EventsError } from "./ErrorFallbacks";
import { EventsContent } from "./EventsContent";
import { EventsSkeleton } from "./LoadingSkeletons";

export function EventsSection({ locale }: { locale: string }) {
  return (
    <ErrorBoundary fallback={<EventsError />}>
      <Suspense fallback={<EventsSkeleton />}>
        <EventsContent locale={locale} />
      </Suspense>
    </ErrorBoundary>
  );
}
