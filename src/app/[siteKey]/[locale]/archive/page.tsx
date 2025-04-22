import { getGenerateMetadata } from "@/lib";
import {
  getEvents,
  getLocalizedContent,
  getPage,
  getSite,
} from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { EventsList, ListEvent } from "@/components/EventList";
import { Pagination } from "@/components/Pagination";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(() =>
  getPage({ slug: "archive" }),
);

const ITEMS_PER_PAGE = 50;

const ArchivePage = async ({ params, searchParams }) => {
  const { locale } = await params;
  await setupSSR({ params });

  const currentPage = parseInt(searchParams?.page as string, 10) || 0;

  const [{ data: events }, { data: page }, { data: site }] = await Promise.all([
    getEvents({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lt: new Date().getTime(),
      dir: "desc",
    }),
    getPage({ slug: "archive" }),
    getSite(),
  ]);

  if (!site) {
    notFound();
  }

  console.log("SDKPage", currentPage, events);

  const pageTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : "archive";

  // Calculate total pages
  const totalPages = events?.count
    ? Math.ceil(events.count / ITEMS_PER_PAGE)
    : 100;

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
        {/* Add Pagination component */}
        {events?.records.length && totalPages > 1 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={
              // TODO: a quick hack. we need to update the API
              events?.records.length < ITEMS_PER_PAGE ? currentPage : totalPages
            }
            baseUrl={`/archive`} // Use locale in base URL
          />
        ) : null}
      </ColumnRight>
    </TwoColumnLayout>
  );
};

export default ArchivePage;
