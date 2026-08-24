import { getLocalizedContent } from "@venuecms/sdk-next";
import { getEvents, getPage, getSite } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";

import { EventsList, ListEvent } from "@/components/EventList";

/** The one markup both spellings of the heading render, so they cannot drift. */
export function EventsHeadingText({ children }: { children: ReactNode }) {
  return <p className="pb-8 text-primary">{children}</p>;
}

/**
 * The heading a listing brings no title of its own: the "events" page record's.
 *
 * Its own component, and so its own boundaries, because it is the one part of
 * the left column that costs a request. A listing page passes its title
 * straight in and this never renders.
 *
 * It draws the whole `<p>` rather than returning bare text so that the pending
 * and failed spellings of this slot are block elements too — a `<div>` skeleton
 * inside the `<p>` would be invalid nesting, and the parser relocating it out
 * breaks the sibling walk React uses to swap a resolved boundary in.
 */
export async function EventsHeading({ locale }: { locale: string }) {
  await connection();

  const { data: page } = await getPage({ slug: "events" });

  const recordTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : null;

  // Emptiness, not absence: a locale saved without a title yields "", which
  // would otherwise draw a blank heading in place of the fallback.
  return (
    <EventsHeadingText>
      {recordTitle?.trim() ? recordTitle : "upcoming events"}
    </EventsHeadingText>
  );
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
