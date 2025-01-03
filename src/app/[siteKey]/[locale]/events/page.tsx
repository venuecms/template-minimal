import { Params } from "@/types";
import {
  getEvents,
  getLocalizedContent,
  getPage,
  getSite,
  setConfig,
} from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { EventsList } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

const Home = async ({ params }: { params: Promise<Params> }) => {
  const { siteKey, locale } = await params;
  setConfig({ siteKey });

  const [{ data: events }, { data: page }, { data: site }] = await Promise.all([
    getEvents({ limit: 60, upcoming: true }),
    getPage({ slug: "events" }),
    getSite(),
  ]);

  if (!site) {
    notFound();
  }

  const pageTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : "upcoming events";

  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <p className="text-primary pb-8">{pageTitle}</p>
      </ColumnLeft>
      <ColumnRight>
        <div className="sm:columns-2 gap-x-8">
          {events?.records.length ? (
            <EventsList events={events.records} site={site} withImage />
          ) : (
            "No events found"
          )}
        </div>
      </ColumnRight>
    </TwoColumnLayout>
  );
};

export default Home;
