import {
  LocalizedContent,
  type SearchParams,
  VenueContent,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { getEvents, getSite } from "@venuecms/sdk-next";
import { ArrowRight } from "lucide-react";
import { connection } from "next/server";

import { Link } from "@/lib/i18n";

import { EventsList, ListEvent } from "@/components/EventList";
import { contentComponents } from "@/components/ListingBlock";
import { TranslatedText } from "@/components/TranslatedText";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

export async function EventsContent({
  locale,
  searchParams,
}: {
  locale: string;
  /**
   * Taken as a promise and awaited here rather than in the route, because this
   * component already renders inside the home page's Suspense boundary. Awaiting
   * it up in `Home` would make the whole home page wait on the request; awaiting
   * it here costs nothing extra, since `connection()` above has already opted
   * this subtree out of the prerender.
   */
  searchParams: Promise<SearchParams>;
}) {
  await connection();

  const [{ data: events }, { data: site }, resolvedSearchParams] =
    await Promise.all([
      getEvents({ limit: 6, upcoming: true }),
      getSite(),
      searchParams,
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
            contentStyles={contentComponents}
            searchParams={resolvedSearchParams}
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
              <div className="w-full grid-cols-1 gap-12 sm:grid">
                <span></span>
                <Link
                  className="flex w-full items-center gap-2 hover:brightness-125 sm:relative sm:flex-row"
                  href="/events"
                >
                  <ArrowRight className="h-4" />{" "}
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
              contentStyles={contentComponents}
              searchParams={resolvedSearchParams}
            />
          </div>
        ) : null}
      </ColumnRight>
    </TwoColumnLayout>
  );
}
