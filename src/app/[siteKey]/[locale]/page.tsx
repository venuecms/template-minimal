import { getLocalizedMetadata } from "@/lib";
import { Params } from "@/types";
import { LocalizedContent, getEvents, getSite, setConfig } from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { Link } from "@/lib/i18n";
import { VenueContent } from "@/lib/utils/renderer";

import { EventFeatured } from "@/components/EventFeatured";
import { EventsList, ListEvent } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { renderedStyles } from "@/components/utils";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}) => {
  const { siteKey, locale } = await params;
  setConfig({ siteKey });

  const { data: site } = await getSite();
  if (!site) {
    return {};
  }

  const metadata = getLocalizedMetadata({
    locale,
    site,
    overrides: {
      content: site.description ?? undefined,
    },
  });

  return metadata;
};

const Home = async ({ params }: { params: Promise<Params> }) => {
  const { siteKey } = await params;
  setConfig({ siteKey });

  const [{ data: site }, { data: events }, { data: featuredEvents }] =
    await Promise.all([
      getSite(),
      getEvents({ limit: 6, upcoming: true }),
      getEvents({ limit: 6, featured: true }),
    ]);

  if (!site) {
    notFound();
  }

  return (
    <>
      {featuredEvents?.records.length ? (
        <div className="flex flex-col pb-16">
          {featuredEvents?.records.map((event) => (
            <EventFeatured
              key={event.id}
              event={event}
              site={site}
              className="lg:pb-64"
            />
          ))}
        </div>
      ) : null}

      <p className="text-secondary sm:hidden">Upcoming events</p>
      <TwoColumnLayout>
        <ColumnLeft className="hidden text-sm text-secondary sm:flex">
          {site.description ? (
            <VenueContent
              className="flex flex-col gap-6"
              content={{ content: site.description } as LocalizedContent}
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
              <div className="w-full grid-cols-2 sm:grid">
                <span></span>
                <Link
                  className="flex w-full sm:relative sm:flex-row"
                  href="/events"
                >
                  → see all upcoming events
                </Link>
              </div>
            </section>
          ) : null}
          {site.description ? (
            <div className="flex sm:hidden">
              <VenueContent
                className="flex flex-col gap-6"
                content={{ content: site.description } as LocalizedContent}
                contentStyles={renderedStyles}
              />
            </div>
          ) : null}
        </ColumnRight>
      </TwoColumnLayout>
    </>
  );
};

export default Home;
