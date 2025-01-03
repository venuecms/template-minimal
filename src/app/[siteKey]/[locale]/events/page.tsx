import { Params } from "@/types";
import {
  getEvents,
  getLocalizedContent,
  getPage,
  setConfig,
} from "@venuecms/sdk";

import { EventsList } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

const Home = async ({ params }: { params: Promise<Params> }) => {
  const { siteKey, locale } = await params;
  setConfig({ siteKey });

  const [{ data: events }, { data: page }] = await Promise.all([
    getEvents({ limit: 60, upcoming: true }),
    getPage({ slug: "events" }),
  ]);

  const pageTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : "upcoming events";

  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <p className="text-primary font-medium pb-8">{pageTitle}</p>
      </ColumnLeft>
      <ColumnRight>
        <div className="sm:columns-2 gap-x-8">
          {events?.records.length ? (
            <EventsList events={events.records} withImage />
          ) : (
            "No events found"
          )}
        </div>
      </ColumnRight>
    </TwoColumnLayout>
  );
};

export default Home;
