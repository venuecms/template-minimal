import { getLocalizedContent } from "@venuecms/sdk-next";
import { getEvents, getPage, getSite } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { EventsList, ListEvent } from "@/components/EventList";

/**
 * The heading a listing brings no title of its own: the "events" page record's.
 *
 * Its own component, and so its own boundary, because it is the one part of the
 * left column that costs a request. A listing page passes its title straight in
 * and this never renders.
 */
export async function EventsHeading({ locale }: { locale: string }) {
  const { data: page } = await getPage({ slug: "events" });

  const recordTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : null;

  // Emptiness, not absence: a locale saved without a title yields "", which
  // would otherwise draw a blank heading in place of the fallback.
  return recordTitle?.trim() ? recordTitle : "upcoming events";
}

/**
 * The records half of the events listing. Draws only the list: the frame, the
 * heading and any page body live in `EventsListSection`, above the Suspense
 * boundary, so none of them wait on this fetch or vanish with it.
 */
export async function EventsListContent() {
  await connection();

  const [{ data: events }, { data: site }] = await Promise.all([
    getEvents({ limit: 60, upcoming: true }),
    getSite(),
  ]);

  if (!site) {
    notFound();
  }

  return events?.records.length ? (
    <EventsList className="gap-y-12">
      {events.records.map((event) => (
        <ListEvent key={event.id} event={event} site={site} withImage />
      ))}
    </EventsList>
  ) : (
    "No events found"
  );
}
