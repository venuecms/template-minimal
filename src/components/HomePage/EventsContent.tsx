import { LocalizedContent } from "@venuecms/sdk";
import { cachedGetEvents, cachedGetSite } from "@/lib/utils";

import { Link } from "@/lib/i18n";
import { VenueContent } from "@/lib/utils/renderer";

import { EventsList, ListEvent } from "@/components/EventList";
import { TranslatedText } from "@/components/TranslatedText";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { renderedStyles } from "@/components/utils";

export async function EventsContent({
  siteContent,
}: {
  siteContent?: { content: LocalizedContent };
}) {
  const [{ data: events }, { data: site }] = await Promise.all([
    cachedGetEvents({ limit: 6, upcoming: true }),
    cachedGetSite(),
  ]);

  if (!site) {
    return null;
  }

  return (
    <TwoColumnLayout>
      <ColumnLeft className="hidden text-sm text-secondary sm:flex">
        {siteContent?.content ? (
          <VenueContent
            className="flex flex-col gap-6"
            content={siteContent.content}
            contentStyles={renderedStyles}
          />
        ) : null}
      </ColumnLeft>
      <ColumnRight>
        {events?.records.length ? (
          <section className="flex flex-col gap-3">
            <EventsList>
              {events.records.map((event) => (
                <ListEvent key={event.id} event={event} site={site} />
              ))}
            </EventsList>
            {events.records.length >= 6 ? (
              <div className="w-full grid-cols-2 sm:grid">
                <span></span>
                <Link
                  className="flex w-full sm:relative sm:flex-row"
                  href="/events"
                >
                  →{" "}
                  <TranslatedText
                    namespace="events"
                    text="see_all_upcoming_events"
                  />
                </Link>
              </div>
            ) : null}
          </section>
        ) : null}

        {siteContent?.content ? (
          <div className="flex sm:hidden">
            <VenueContent
              className="flex flex-col gap-6"
              content={siteContent.content}
              contentStyles={renderedStyles}
            />
          </div>
        ) : null}
      </ColumnRight>
    </TwoColumnLayout>
  );
}
