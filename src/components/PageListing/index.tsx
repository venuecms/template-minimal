/**
 * The listing a page renders in place of its own content.
 *
 * A page marked in the CMS as the site's news / events / products index shows
 * that index, not the page layout — which is what lets an author put the index
 * anywhere in the tree and still have it look like `/events`. The dispatch
 * lives here, in one place, so `/p/<slug>` does not grow a chain of page-type
 * branches and so every listing keeps exactly one implementation: these are the
 * same sections the static routes render.
 *
 * Which type maps to which listing is {@link resolvePageListingLayout}'s job;
 * this only renders what that returned.
 *
 * Not to be confused with `PageListingBlock`, which is a listing *of pages*
 * placed inside rich-text content. This is the listing a page *is*.
 */
import { MAX_PAGE, type SearchParams } from "@venuecms/sdk-next";

import { EventsListSection } from "@/components/EventsPage";
import { NewsView } from "@/components/News";
import { ProductsListSection } from "@/components/ShopPage";
import type { PageListingLayout } from "@/components/utils/pageLayout";

/**
 * The page a URL is asking the products listing for, or 0.
 *
 * Read inline rather than through a shared helper on purpose. VEN-514 (#69)
 * lands `readPage` with exactly these rules in `components/Pagination`, and two
 * exported readers of one param is how a route's pager and a listing block's
 * pager start answering the same URL differently. This goes when that lands.
 *
 * Digits rather than `Number()`, which reads "0x10" as 16 and "1e3" as 1000 —
 * query strings no link produces, the second quietly asking the endpoint for
 * the deepest offset scan it permits. A repeated param takes its first value,
 * as a route would read `?page=1&page=2`. Past MAX_PAGE clamps rather than
 * resetting, so the deepest reachable page still renders a link back.
 */
const readPage = (searchParams: SearchParams): number => {
  const raw = searchParams.page;
  const value = Array.isArray(raw) ? raw[0] : raw;

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
  /**
   * The page's own title, for the listings that draw one.
   *
   * News and events both head their layout with a title, and a page an author
   * titled and then typed as one of those would otherwise announce itself with
   * whatever heading the static route reads for itself — a wrong title rather
   * than a missing one. The shop draws no heading at all, on `/shop` or
   * anywhere else, so there is nothing to hand it; see the products branch.
   */
  title?: string;
  /**
   * The path this page lives at, for any pager the listing draws. Only the
   * route knows it, and a listing that guessed `/shop` would page a reader
   * clean off the page they are on.
   */
  basePath: string;
  /** The route's search params, which carry the page being read. */
  searchParams: SearchParams;
}) => {
  switch (layout) {
    case "news":
      return <NewsView title={title} searchParams={searchParams} />;
    case "events":
      return <EventsListSection locale={locale} title={title} />;
    // No title: this template's shop is a bare grid with no heading slot to
    // put one in, and inventing one here would be a layout decision rather
    // than a port. Showing what an author wrote above the products is what
    // #66 ("'Shop' page content shows above products") is for.
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
