import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getLocalizedContent } from "@venuecms/sdk";
import { cachedGetEvents, cachedGetPage, cachedGetSite } from "@/lib/utils";
import { notFound } from "next/navigation";

import { EventsList, ListEvent } from "@/components/EventList";
import { Pagination } from "@/components/Pagination";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(() =>
  cachedGetPage({ slug: "archive" }),
);

const ITEMS_PER_PAGE = 50;

const ArchivePage = async ({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ page: string }>;
}) => {
  const { locale } = await params;
  await setupSSR({ params });

  const currentPage = parseInt((await searchParams)?.page as string, 10) || 0;

  // Round down to nearest minute for better cache hits
  const now = new Date();
  now.setSeconds(0, 0);
  const nowRoundedToMinute = now.getTime();

  const [{ data: events }, { data: page }, { data: site }] = await Promise.all([
    cachedGetEvents({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lt: nowRoundedToMinute,
      dir: "desc",
    }),
    cachedGetPage({ slug: "archive" }),
    cachedGetSite(),
  ]);

  if (!site) {
    notFound();
  }

  const pageTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : "archive";

  // Calculate total pages
  // @ts-expect-error - this will change once we update the API
  const totalPages = events?.count
    ? // @ts-expect-error - this will change once we update the API
      Math.ceil(events.count / ITEMS_PER_PAGE)
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
