import { Suspense } from "react";
import {
  getEvents,
  getLocalizedContent,
  getPage,
  getSite,
} from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { EventsList, ListEvent } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

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

async function EventsListContent({ locale }: { locale: string }) {
  const [{ data: events }, { data: page }, { data: site }] = await Promise.all([
    getEvents({ limit: 60, upcoming: true }),
    getPage({ slug: "events" }),
    getSite(),
  ]);

  if (!site) {
    notFound();
  }

  const pageTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : "upcoming events";

  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <p className="pb-8 text-primary">{pageTitle}</p>
      </ColumnLeft>
      <ColumnRight>
        {events?.records.length ? (
          <EventsList className="gap-y-12">
            {events.records.map((event) => (
              <ListEvent key={event.id} event={event} site={site} withImage />
            ))}
          </EventsList>
        ) : (
          "No events found"
        )}
      </ColumnRight>
    </TwoColumnLayout>
  );
}

export function EventsListSection({ locale }: { locale: string }) {
  return (
    <Suspense fallback={<EventsListSkeleton />}>
      <EventsListContent locale={locale} />
    </Suspense>
  );
}
