import { connection } from "next/server";
import { LocalizedContent, getLocalizedContent } from "@venuecms/sdk";
import { cachedGetEvents, cachedGetSite } from "@/lib/utils";

import { Link } from "@/lib/i18n";
import { VenueContent } from "@/lib/utils/renderer";

import { EventsList, ListEvent } from "@/components/EventList";
import { TranslatedText } from "@/components/TranslatedText";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { renderedStyles } from "@/components/utils";

export async function EventsContent({ locale }: { locale: string }) {
  await connection();

  const [{ data: events }, { data: site }] = await Promise.all([
    cachedGetEvents({ limit: 6, upcoming: true }),
    cachedGetSite(),
  ]);

  if (!site) {
    return null;
  }

  const webSiteSettings = site.webSites ? site.webSites[0] : undefined;
  const { content: siteContent } = webSiteSettings?.localizedContent?.length
    ? getLocalizedContent(webSiteSettings.localizedContent, locale)
    : { content: { content: site.description } as LocalizedContent };

  return (
    <TwoColumnLayout>
      <ColumnLeft className="hidden text-sm text-secondary sm:flex">
        {siteContent ? (
          <VenueContent
            className="flex flex-col gap-6"
            content={siteContent}
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

        {siteContent ? (
          <div className="flex sm:hidden">
            <VenueContent
              className="flex flex-col gap-6"
              content={siteContent}
              contentStyles={renderedStyles}
            />
          </div>
        ) : null}
      </ColumnRight>
    </TwoColumnLayout>
  );
}
