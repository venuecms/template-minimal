import { Suspense } from "react";

import { EventsList } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/Input/Skeleton";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { EventsHeading, EventsListContent } from "./EventsListContent";

function EventsListError() {
  return (
    <p className="text-secondary">
      Unable to load events. Please try refreshing the page.
    </p>
  );
}

function EventsListSkeleton() {
  return (
    <EventsList className="gap-y-12">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex flex-col gap-3 pb-8">
          <Skeleton className="aspect-video w-full sm:w-80" />
          <div className="flex flex-col gap-1">
            <Skeleton className="w-32" />
            <Skeleton className="w-48" />
            <Skeleton className="w-24" />
          </div>
        </div>
      ))}
    </EventsList>
  );
}

/**
 * The frame of the events listing, shared by /events and by an EVENTLIST page.
 *
 * The page's own body sits *outside* the boundaries on purpose. It is already
 * in hand and costs no request, so putting it under the Suspense would hide
 * readable content behind the records' skeleton and shift the layout when they
 * resolved, and putting it under the ErrorBoundary would delete an author's
 * prose because an unrelated fetch failed. The heading is the same, except when
 * it has to be read from the "events" record — then it gets a boundary of its
 * own rather than sharing the records'.
 */
export function EventsListSection({
  locale,
  title,
  children,
}: {
  locale: string;
  /** Heading; a listing page passes its own, else the "events" record is read for one. */
  title?: string;
  children?: React.ReactNode;
}) {
  // Emptiness, not absence: a page saved without a title for this locale yields
  // "", and `??` would keep it and draw an empty heading column.
  const ownTitle = title?.trim() ? title : null;

  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <p className="pb-8 text-primary">
          {ownTitle ?? (
            <Suspense fallback={<Skeleton className="w-32" />}>
              <EventsHeading locale={locale} />
            </Suspense>
          )}
        </p>
      </ColumnLeft>
      <ColumnRight>
        {children}
        <ErrorBoundary fallback={<EventsListError />}>
          <Suspense fallback={<EventsListSkeleton />}>
            <EventsListContent />
          </Suspense>
        </ErrorBoundary>
      </ColumnRight>
    </TwoColumnLayout>
  );
}
