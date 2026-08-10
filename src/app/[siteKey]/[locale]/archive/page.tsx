import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import {
  type SearchParams,
  getEvents,
  getLocalizedContent,
  getPage,
  getSite,
} from "@venuecms/sdk-next";
import { notFound } from "next/navigation";

import { EventsList, ListEvent } from "@/components/EventList";
import { Pagination } from "@/components/Pagination";
import { readPage } from "@/components/Pagination/pagination";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(() =>
  getPage({ slug: "archive" }),
);

const ITEMS_PER_PAGE = 50;

const ArchivePage = async ({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) => {
  const { locale } = await params;
  await setupSSR({ params });

  const resolvedSearchParams = await searchParams;
  const currentPage = readPage(resolvedSearchParams);

  // Round down to nearest minute for better cache hits
  const now = new Date();
  now.setSeconds(0, 0);
  const nowRoundedToMinute = now.getTime();

  const [{ data: events }, { data: page }, { data: site }] = await Promise.all([
    getEvents({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lt: nowRoundedToMinute,
      dir: "desc",
    }),
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
        <Pagination
          page={currentPage}
          pageSize={ITEMS_PER_PAGE}
          result={events}
          basePath="/archive"
          searchParams={resolvedSearchParams}
          label="Archive pagination"
        />
      </ColumnRight>
    </TwoColumnLayout>
  );
};

export default ArchivePage;
