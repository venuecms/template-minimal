/** The listing a page *is*, not `PageListingBlock`, which is a listing of pages. */
import {
  type LocalizedContent,
  MAX_PAGE,
  type SearchParams,
  VenueContent,
} from "@venuecms/sdk-next";

import { EventsListSection } from "@/components/EventsPage";
import { contentComponents } from "@/components/ListingBlock";
import { NewsView } from "@/components/News";
import { ProductsListSection } from "@/components/ShopPage";
import type { PageListingLayout } from "@/components/utils/pageLayout";

// Duplicates VEN-514's readPage (#69) on purpose; drop when that lands.
const readPage = (searchParams: SearchParams): number => {
  const raw = searchParams.page;
  const value = Array.isArray(raw) ? raw[0] : raw;

  // Digits only: Number() reads "1e3" as the deepest offset scan the endpoint allows.
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return 0;
  }

  return Math.min(Number(value), MAX_PAGE);
};

export const PageListing = ({
  layout,
  locale,
  title,
  content,
  basePath,
  searchParams,
}: {
  layout: PageListingLayout;
  locale: string;
  title?: string;
  /** The page's own body, which is a listing's content as much as the records are. */
  content?: LocalizedContent;
  /** Path any pager builds hrefs against; only the route knows it. */
  basePath: string;
  searchParams: SearchParams;
}) => {
  // Emptiness decided here, not in the views: a VenueContent that renders null
  // still leaves them holding a spacer around nothing.
  const body =
    content?.content || content?.contentJSON ? (
      <VenueContent
        className="flex max-w-[42rem] flex-col gap-6 text-sm"
        content={content}
        contentStyles={contentComponents}
        searchParams={searchParams}
      />
    ) : null;

  switch (layout) {
    // No body: the news layout already renders an article's content in full.
    case "news":
      return <NewsView title={title} searchParams={searchParams} />;
    case "events":
      return (
        <EventsListSection locale={locale} title={title}>
          {body}
        </EventsListSection>
      );
    // No title: the shop grid has no heading slot.
    case "products":
      return (
        <ProductsListSection
          locale={locale}
          basePath={basePath}
          currentPage={readPage(searchParams)}
        >
          {body}
        </ProductsListSection>
      );
  }
};
