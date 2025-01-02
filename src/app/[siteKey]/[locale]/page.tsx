import { Params } from "@/types";
import { LocalizedContent, getEvents, getSite, setConfig } from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { Link } from "@/lib/i18n";
import { VenueContent } from "@/lib/utils/renderer";

import { EventsList } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { renderedStyles } from "@/components/utils";

const Home = async ({ params }: { params: Promise<Params> }) => {
  const { siteKey } = await params;
  setConfig({ siteKey });

  const [{ data: site }, { data: events, error }, { data: featuredEvents }] =
    await Promise.all([
      getSite(),
      getEvents({ limit: 6, upcoming: true }),
      getEvents({ limit: 6, featured: true }),
    ]);

  if (!site) {
    notFound();
  }

  return (
    <TwoColumnLayout>
      <ColumnLeft className="hidden sm:flex text-sm text-secondary">
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
            <EventsList events={events.records} />
            <Link
              className="flex sm:flex-row sm:relative sm:left-1/2 w-full"
              href="/events"
            >
              → see all upcoming events
            </Link>
          </section>
        ) : null}
        {site.description ? (
          <div className="sm:hidden flex">
            <VenueContent
              className="flex flex-col gap-6"
              content={{ content: site.description } as LocalizedContent}
              contentStyles={renderedStyles}
            />
          </div>
        ) : null}
      </ColumnRight>
    </TwoColumnLayout>
  );
};

export default Home;
