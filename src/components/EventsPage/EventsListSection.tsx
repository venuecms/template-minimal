import { Suspense } from "react";

import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";
import { EventsList } from "@/components/EventList";

import { EventsListContent } from "./EventsListContent";

function EventsListError() {
  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary" />
      <ColumnRight>
        <p className="text-secondary">
          Unable to load events. Please try refreshing the page.
        </p>
      </ColumnRight>
    </TwoColumnLayout>
  );
}

function EventsListSkeleton() {
  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <div className="pb-8">
          <div className="h-4 w-32 bg-primary opacity-[3%]" />
        </div>
      </ColumnLeft>
      <ColumnRight>
        <EventsList className="gap-y-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-3 pb-8">
              <div className="aspect-video w-full bg-primary opacity-[3%] sm:w-80" />
              <div className="flex flex-col gap-1">
                <div className="h-4 w-32 bg-primary opacity-[3%]" />
                <div className="h-4 w-48 bg-primary opacity-[3%]" />
                <div className="h-4 w-24 bg-primary opacity-[3%]" />
              </div>
            </div>
          ))}
        </EventsList>
      </ColumnRight>
    </TwoColumnLayout>
  );
}

export function EventsListSection({ locale }: { locale: string }) {
  return (
    <ErrorBoundary fallback={<EventsListError />}>
      <Suspense fallback={<EventsListSkeleton />}>
        <EventsListContent locale={locale} />
      </Suspense>
    </ErrorBoundary>
  );
}
