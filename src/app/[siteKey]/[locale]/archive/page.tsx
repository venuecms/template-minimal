import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import {
  getEvents,
  getLocalizedContent,
  getPage,
  getSite,
  setConfig,
} from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { EventsList, ListEvent } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

export const generateMetadata = getGenerateMetadata(() =>
  getPage({ slug: "archive" }),
);

const ArchivePage = async ({ params }: { params: Promise<Params> }) => {
  const { siteKey, locale } = await params;
  setConfig({ siteKey });

  const [{ data: events }, { data: page }, { data: site }] = await Promise.all([
    getEvents({ limit: 60, lt: new Date().getTime(), dir: "desc" }),
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
        <p className="font-medium text-primary">{pageTitle}</p>
      </ColumnLeft>
      <ColumnRight>
        {events?.records.length ? (
          <EventsList>
            {events.records.map((event) => (
              <ListEvent
                key={event.id}
                event={event}
                site={site}
                withTime={false}
                dateTemplate={"d MMMM yyyy"}
              />
            ))}
          </EventsList>
        ) : (
          "No events found"
        )}
      </ColumnRight>
    </TwoColumnLayout>
  );
};

export default ArchivePage;
