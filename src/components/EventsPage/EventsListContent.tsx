import { getLocalizedContent } from "@venuecms/sdk-next";
import { getEvents, getPage, getSite } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { EventsList, ListEvent } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

export async function EventsListContent({
  locale,
  title,
}: {
  locale: string;
  /**
   * The heading, when the caller already knows it.
   *
   * `/events` passes none and looks up the page record slugged "events" for
   * one. A page typed as the event listing stands in for that route and holds
   * the title an author actually wrote, so it passes its own — otherwise such
   * a page would head itself with a title from a different record entirely.
   */
  title?: string;
}) {
  await connection();

  const [{ data: events }, { data: page }, { data: site }] = await Promise.all([
    getEvents({ limit: 60, upcoming: true }),
    // Skipped when the caller brought a title: the page record is read for
    // nothing else here.
    title ? { data: null } : getPage({ slug: "events" }),
    getSite(),
  ]);

  if (!site) {
    notFound();
  }

  const pageTitle =
    title ??
    (page
      ? getLocalizedContent(page.localizedContent, locale).content.title
      : "upcoming events");

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
