import { LocalizedContent, getEvents, getSite } from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { VenueContent } from "@/lib/utils/renderer";

import { EventsList } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { renderedStyles } from "@/components/utils";

const Home = async () => {
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
      <ColumnLeft className="text-sm text-secondary">
        {site.description ? (
          <VenueContent
            className="flex flex-col gap-6 pr-32"
            content={{ content: site.description } as LocalizedContent}
            contentStyles={renderedStyles}
          />
        ) : null}
      </ColumnLeft>
      <ColumnRight>
        {events?.records.length ? <EventsList events={events.records} /> : null}
      </ColumnRight>
    </TwoColumnLayout>
  );
};

export default Home;
