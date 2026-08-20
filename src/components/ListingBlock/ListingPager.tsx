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
import { useTranslations } from "next-intl";

import { PaginationLinks } from "@/components/Pagination";

/** The record types that paginate, as the pager's dictionary names them. */
export type ListingKind = "events" | "news" | "products" | "profiles";

export const PaginatedListing = ({
  pagination,
  records,
  listing,
  children,
}: {
  pagination: ListingPagination | null;
  /**
   * The same records the children were built from — taken rather than a derived
   * `isEmpty` flag so a caller cannot pass one that disagrees with what it drew.
   */
  records: readonly unknown[];
  /**
   * Which record type this block lists.
   *
   * A dictionary key rather than a display string: the name it ends up in is
   * announced to a screen reader, so it has to be resolved in the reader's
   * language rather than handed over already written in English.
   */
  listing: ListingKind;
  children: React.ReactNode;
}) => {
  const t = useTranslations("pagination");
  const links = pagination?.links;

  const pager =
    links && (links.prevHref || links.nextHref) ? (
      <PaginationLinks
        prevHref={links.prevHref}
        nextHref={links.nextHref}
        // Naming the nav after the record type alone is not enough: an article
        // can hold two event listings — upcoming and past, say — and two
        // landmarks both announcing "Events pagination" leave a reader no way
        // to tell which listing either one moves. The block's search param is
        // the one thing guaranteed to differ between them, that being the whole
        // reason the SDK derives it, so it is what separates the names. Opaque
        // read aloud, but a distinguishable name beats an ambiguous one, and it
        // is all a block is told about itself.
        label={t("listing_label", { listing: t(listing), id: links.param })}
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
