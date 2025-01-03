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

  // const { data: events } = await getEvents({ limit: 60, dir: "asc" });
  const [{ data: events }, { data: page }, { data: site }] = await Promise.all([
    getEvents({ limit: 60, lt: new Date().getTime() }),
    getPage({ slug: "archive" }),
    getSite(),
  ]);

  if (!site) {
    notFound();
  }

  const pageTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : "archive";

  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <p className="text-primary font-medium">{pageTitle}</p>
      </ColumnLeft>
      <ColumnRight>
        <div className="sm:columns-2 gap-x-8">
          {events?.records.length ? (
            <EventsList events={events.records} site={site} />
          ) : (
            "No events found"
          )}
        </div>
      </ColumnRight>
    </TwoColumnLayout>
  );
};

export default Home;
