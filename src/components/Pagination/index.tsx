import type { SearchParams } from "@venuecms/sdk-next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ReactNode } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { routePageHref, routePaginationMeta } from "./pagination";

/**
 * The prev/next control itself: two arrows and nothing else.
 *
 * Takes the hrefs already built rather than a page number and a base URL,
 * because its two callers know different things. A listing page knows the route
 * it is on and counts from there; a listing block inside content does not know
 * its own URL at all — the SDK hands it hrefs that preserve the rest of the
 * query string, since a second listing on the same page keeps its own page in
 * a param of its own.
 *
 * A null href is the disabled direction, so "there is no previous page" has one
 * spelling rather than a boolean that can disagree with the href beside it.
 */
export const PaginationLinks = ({
  prevHref,
  nextHref,
  label = "Pagination",
  scroll = true,
  className,
}: {
  prevHref: string | null;
  nextHref: string | null;
  /**
   * The nav landmark's accessible name.
   *
   * Defaulted rather than fixed because a page can now carry several pagers —
   * one per listing block in the content — and landmarks that all announce
   * "Pagination" leave a screen-reader user no way to tell which listing each
   * one moves.
   */
  label?: string;
  /**
   * Whether following a page link scrolls to the top, as Next does by default.
   *
   * True suits a pager that owns its page: `/archive` and `/shop` are the
   * listing, so the new page's first record is what a reader wants in view.
   * A listing block is the exception — it sits inside an article the reader is
   * part-way through, and scrolling to the top there abandons the content they
   * were reading to page a few records inside it.
   */
  scroll?: boolean;
  className?: string;
}) => {
  // Two disabled arrows are a landmark a screen-reader user can tab to and
  // find nothing in, so a pager with nowhere to go is not a pager. Decided
  // here, off the hrefs, because the hrefs are what this renders — a caller
  // reasoning from its own booleans can disagree with the href beside it.
  if (!prevHref && !nextHref) {
    return null;
  }

  const renderLink = (
    href: string | null,
    children: ReactNode,
    linkLabel: string,
  ) => {
    // The arrows are icons with no text, so without a name on the link itself
    // there is nothing for a screen reader to announce but the URL.
    if (!href) {
      return (
        <span
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none opacity-50"
        >
          {children}
        </span>
      );
    }

    return (
      <Link href={href} aria-label={linkLabel} scroll={scroll}>
        {children}
      </Link>
    );
  };

  return (
    <nav
      aria-label={label}
      className={cn("mt-8 flex items-center justify-between gap-4", className)}
    >
      {renderLink(prevHref, <ArrowLeft className="size-6" />, "Previous page")}
      {renderLink(nextHref, <ArrowRight className="size-6" />, "Next page")}
    </nav>
  );
};

/**
 * What a paginated endpoint hands back: this page's records, and the total
 * behind them where the endpoint reports one.
 *
 * Deliberately structural rather than one of the SDK's response types, so the
 * events and products responses both satisfy it without the pager knowing what
 * it is paging.
 */
type PagedResult = {
  records: readonly unknown[];
  count?: number | null;
};

/**
 * The pager for a paginated route.
 *
 * Takes the page it asked for, the size it asked for, and the endpoint's reply
 * whole — then does the arithmetic itself. Two things it deliberately does not
 * take, both because a caller got them wrong:
 *
 * - A page total. Its two callers used to compute one each and disagreed by
 *   one, because "how many pages there are" and "the last page's index" differ
 *   by one and the prop name did not say which it wanted.
 * - A record count. `/shop` splits its page into a featured four and the rest,
 *   so a `pageLength` prop is a standing invitation to pass the remainder and
 *   have the pager read a full page as short. Reading the length off the reply
 *   is what makes that unrepresentable — the same reason `PaginatedListing`
 *   takes `records` rather than a derived flag.
 *
 * Renders nothing when the whole listing fits on one page. An empty page keeps
 * its pager if there is a page behind it, so a reader who lands on one — which
 * paging without a count permits — is not stranded with no link back.
 */
export const Pagination = ({
  page,
  pageSize,
  result,
  basePath,
  searchParams,
  label,
  className,
}: {
  page: number;
  /** The `limit` the endpoint was asked for, which the arithmetic counts in. */
  pageSize: number;
  /** The endpoint's reply, or null/undefined if the fetch yielded nothing. */
  result: PagedResult | null | undefined;
  /** The route the pager links within, e.g. `/archive`. */
  basePath: string;
  /**
   * The route's own search params, so paging carries the rest of the query
   * string through instead of dropping it.
   */
  searchParams: SearchParams;
  label?: string;
  className?: string;
}) => {
  const { hasPrev, hasNext, pageCount } = routePaginationMeta({
    page,
    pageSize,
    count: result?.count ?? null,
    pageLength: result?.records.length ?? 0,
  });

  // "Previous" from a page past the end goes to the last real page, not to the
  // empty page before it. `readPage` clamps anything up to MAX_PAGE, so
  // /archive?page=400 renders — and stepping back one at a time would be
  // hundreds of empty pages and hundreds of offset scans to reach content.
  // Only possible where a count says where the end is.
  const lastPage = pageCount === null ? null : Math.max(0, pageCount - 1);
  const prevPage = lastPage === null ? page - 1 : Math.min(page - 1, lastPage);

  return (
    <PaginationLinks
      prevHref={
        hasPrev ? routePageHref(searchParams, basePath, prevPage) : null
      }
      nextHref={
        hasNext ? routePageHref(searchParams, basePath, page + 1) : null
      }
      label={label}
      className={className}
    />
  );
};
