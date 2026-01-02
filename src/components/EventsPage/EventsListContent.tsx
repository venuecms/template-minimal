import { getLocalizedContent } from "@venuecms/sdk";
import { cachedGetEvents, cachedGetPage, cachedGetSite } from "@/lib/utils";
import { notFound } from "next/navigation";

import { EventsList, ListEvent } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

export async function EventsListContent({ locale }: { locale: string }) {
  const [{ data: events }, { data: page }, { data: site }] = await Promise.all([
    cachedGetEvents({ limit: 60, upcoming: true }),
    cachedGetPage({ slug: "events" }),
    cachedGetSite(),
  ]);

  if (!site) {
    notFound();
  }

  const pageTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : "upcoming events";

  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-lg">
        <p className="pb-8 text-primary">{pageTitle}</p>
      </ColumnLeft>
      <ColumnRight>
        {events?.records.length ? (
          <EventsList className="gap-y-4">
            {events.records.map((event) => (
              <ListEvent key={event.id} event={event} site={site} />
            ))}
          </EventsList>
        ) : (
          "No events found"
        )}
      </ColumnRight>
    </TwoColumnLayout>
  );
}
