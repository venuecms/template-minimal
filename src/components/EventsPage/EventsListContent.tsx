import { getLocalizedContent } from "@venuecms/sdk-next";
import { getEvents, getPage, getSite } from "@venuecms/sdk-next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { EventsList, ListEvent } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

export async function EventsListContent({
  locale,
  slug,
}: {
  locale: string;
  /**
   * The page record this listing titles itself from. Passed rather than fixed
   * at "events" because the listing has two mounts: the /events route, and any
   * page whose type is EVENTLIST, which lives at /p/<slug> and carries its own
   * title.
   */
  slug: string;
}) {
  await connection();

  const [{ data: events }, { data: page }, { data: site }, t] =
    await Promise.all([
      getEvents({ limit: 60, upcoming: true }),
      getPage({ slug }),
      getSite(),
      getTranslations("events"),
    ]);

  if (!site) {
    notFound();
  }

  const pageTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : t("upcoming_events");

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
          t("no_events_found")
        )}
      </ColumnRight>
    </TwoColumnLayout>
  );
}
