/**
 * What a paginated listing block draws: its records, then its pager.
 *
 * The SDK does the page arithmetic and builds the hrefs — it is the only party
 * that can, since a block sits too deep to read the route's search params and
 * its page lives in a param named after the block rather than a shared `?page=`.
 * What is left here is the template's half: whether a pager is worth drawing,
 * and what it looks like.
 *
 * Three ways there is nothing to draw, and they are different situations:
 *
 * - `pagination` is null — the author set no page size, so the endpoint returned
 *   every record and there are no pages.
 * - `links` is null — nobody threaded `searchParams` into `VenueContent`, so
 *   there is no URL to link to. The records still render; only the pager is
 *   lost. This is what content rendered inside a `<Link>` relies on, where a
 *   pager would nest anchors.
 * - Both hrefs are null — the whole listing fits on one page.
 *
 * That last check reads the hrefs rather than the `hasPrev`/`hasNext` booleans
 * beside them. Both describe the same fact, and the pager renders hrefs, so
 * reading those is what stops it drawing a nav of two dead arrows if the SDK
 * ever suppresses an href without clearing the matching boolean — it already
 * has one such rule, clamping `nextHref` at MAX_PAGE.
 *
 * The empty case is the interesting one. A listing with nothing to show renders
 * nothing at all — it sits mid-prose, where an empty-state message would read as
 * content the author wrote. But a reader can land on an empty page legitimately:
 * without a count to divide, the SDK offers a next link whenever a page comes
 * back full, so the page after a listing whose length is an exact multiple of
 * the page size is empty. Dropping the pager there would strand them with no
 * link back. So an empty page keeps its pager if there is a page behind it, and
 * only a genuinely empty listing renders nothing.
 */
import type { ListingPagination } from "@venuecms/sdk-next";

import { PaginationLinks } from "@/components/Pagination";

export const PaginatedListing = ({
  pagination,
  records,
  label,
  children,
}: {
  pagination: ListingPagination | null;
  /**
   * The same records the children were built from — taken rather than a derived
   * `isEmpty` flag so a caller cannot pass one that disagrees with what it drew.
   */
  records: readonly unknown[];
  /** Names this pager's nav, so several on one page stay tellable apart. */
  label: string;
  children: React.ReactNode;
}) => {
  const links = pagination?.links;

  const pager =
    links && (links.prevHref || links.nextHref) ? (
      <PaginationLinks
        prevHref={links.prevHref}
        nextHref={links.nextHref}
        label={`${label} pagination`}
        // A block is a few records inside an article, so paging it must leave
        // the reader where they were. Next scrolls to the top on navigation by
        // default, which reads as the whole page having reloaded.
        scroll={false}
      />
    ) : null;

  if (!records.length) {
    return links?.prevHref ? pager : null;
  }

  return (
    <>
      {children}
      {pager}
    </>
  );
};
