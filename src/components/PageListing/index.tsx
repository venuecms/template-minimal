/** The listing a page *is*, not `PageListingBlock`, which is a listing of pages. */
import { MAX_PAGE, type SearchParams } from "@venuecms/sdk-next";

import { EventsListSection } from "@/components/EventsPage";
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
  basePath,
  searchParams,
}: {
  layout: PageListingLayout;
  locale: string;
  title?: string;
  /** Path any pager builds hrefs against; only the route knows it. */
  basePath: string;
  searchParams: SearchParams;
}) => {
  switch (layout) {
    case "news":
      return <NewsView title={title} searchParams={searchParams} />;
    case "events":
      return <EventsListSection locale={locale} title={title} />;
    // No title: the shop grid has no heading slot; page content above it is #66.
    case "products":
      return (
        <ProductsListSection
          locale={locale}
          basePath={basePath}
          currentPage={readPage(searchParams)}
        />
      );
  }
};
