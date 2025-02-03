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
  getPage({ slug: "events" }),
);

const EventsPage = async ({ params }: { params: Promise<Params> }) => {
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
      <ColumnLeft className="text-lg text-secondary">
        <p className="pb-8 text-primary">{pageTitle}</p>
      </ColumnLeft>
      <ColumnRight>
        {events?.records.length ? (
          <EventsList className="gap-y-12">
            {events.records.map((event) => (
              <ListEvent key={event.id} event={event} site={site} withImage />
            ))}
          </EventsList>
        ) : (
          "No events found"
        )}
      </ColumnRight>
    </TwoColumnLayout>
  );
};

export default EventsPage;
