/**
 * The page arithmetic for a route that paginates: `/archive` and `/shop`.
 *
 * Pure — numbers and strings in, numbers and strings out — so the off-by-ones
 * are testable without a network or a render. The rules themselves are stated
 * on each function; `./pagination.test.ts` is where they are pinned.
 *
 * ## Why this is here and not imported
 *
 * sdk-next resolves pagination for listing blocks *inside* content and hands
 * each block a finished `ListingPagination`, hrefs included; `PaginatedListing`
 * just draws it. A top-level route gets no such help — it calls `getEvents` /
 * `getProducts` itself, so it has to do its own arithmetic.
 *
 * sdk-next 1.13 has these rules internally, but its barrel (`dist/index.d.ts`)
 * re-exports only the types and bounds from that module — `paginationMeta`,
 * `pageHref`, `pageLinks` and `readPage` are not reachable at any import path.
 * That is an omission upstream rather than a missing capability, so the fix is
 * to export them there and delete this file. See VEN-514.
 *
 * Until then this stays deliberately close to the SDK's shapes — it returns the
 * SDK's own `PaginationMeta` and honours the SDK's `MAX_PAGE` — but the
 * functions are named `route*` rather than mirroring the SDK's names. That is
 * on purpose: the SDK's `pageHref(searchParams, param, page)` and this
 * `routePageHref(searchParams, basePath, page)` take the same three types in the
 * same order and mean different things by the middle one, so a same-name
 * version would let a future "just swap the import" typecheck and then quietly
 * build the wrong URLs.
 */
import {
  MAX_PAGE,
  type PaginationMeta,
  type SearchParams,
} from "@venuecms/sdk-next";

/**
 * The query param both paginated routes count in.
 *
 * A shared `?page=` is safe here in a way it is not for a listing block: a route
 * has one listing, where an article can hold several and each needs a param of
 * its own.
 */
export const PAGE_PARAM = "page";

/**
 * How many characters of inherited query string a pager href will carry.
 *
 * The params are a reader's to edit and the routes are public and cached, so
 * without a cap an 8KB junk query string is echoed into every pager link on the
 * page. Past the budget the extra params are dropped and only the page survives
 * — a link that still works, rather than one that carries the junk twice.
 */
const MAX_CARRIED_QUERY = 1024;

/**
 * The page arithmetic.
 *
 * There is a next page only if this page returned something *and* there is
 * reason to think more follows. The two halves answer different failure modes:
 *
 * - With a count, `(page + 1) * pageSize < count` — sdk-next's rule. An
 *   exactly-full last page has no next, and a count of zero has neither
 *   direction. Comparing a page index against a page *count* is what put
 *   `/archive` one page past the end.
 * - Without one, which the products and profiles endpoints may do, a full page
 *   is the only evidence another exists. It costs one empty page at the end of
 *   a listing whose length is an exact multiple of the page size — the standard
 *   price of paging a total nobody reported, and cheaper than assuming no next
 *   (which hides records) or assuming one never stops (which is the literal 100
 *   pages this replaced).
 *
 * The empty-page terminator is the part sdk-next does not have, and it is here
 * because a count can over-report against the records actually returned:
 * `/archive` asks for past events only (`lt`), and a count taken before that
 * filter would march the pager through empty page after empty page. That is
 * what the deleted `// TODO: a quick hack. we need to update the API` guard was
 * for. It stopped on any *short* page, which is stronger than this and costs
 * too much: a listing that returns 47 of 50 mid-way — records dropped
 * post-limit, say — would strand every page behind it, which is the shape
 * `/shop` is most likely to hit. Stopping only on an *empty* page keeps those
 * reachable while still bounding an over-reporting count to a single wasted
 * page rather than a walk to the end of the count.
 */
export const routePaginationMeta = ({
  page,
  pageSize,
  count,
  pageLength,
}: {
  page: number;
  pageSize: number;
  count: number | null;
  /** How many records this page actually returned. */
  pageLength: number;
}): PaginationMeta => {
  const returnedSomething = pageLength > 0;
  const moreExpected =
    count === null ? pageLength >= pageSize : (page + 1) * pageSize < count;

  return {
    page,
    pageNumber: page + 1,
    pageSize,
    count,
    pageCount: count === null ? null : Math.ceil(count / pageSize),
    hasPrev: page > 0,
    // Bounded because the countless rule has no natural end and the page comes
    // off the query string: without it a pager walks a reader — or a crawler —
    // arbitrarily deep into offset scans.
    hasNext: returnedSomething && moreExpected && page < MAX_PAGE,
  };
};

/**
 * The page the URL asks for.
 *
 * Matched as digits rather than handed to `Number()`, which reads "0x10" as 16,
 * "1e3" as 1000 and " 7 " as 7 — query strings no link produces, the middle one
 * quietly asking the endpoint for the deepest offset scan it permits. A
 * repeated param takes its first value, as a route would read `?page=1&page=2`.
 * Anything else reads as page 0: a hand-edited URL should show the first page
 * rather than break the route. Past MAX_PAGE clamps rather than resetting, so
 * the deepest reachable page still renders a link back.
 */
export const readPage = (searchParams: SearchParams): number => {
  const raw = searchParams[PAGE_PARAM];
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return 0;
  }

  return Math.min(Number(value), MAX_PAGE);
};

/**
 * The href for one page of a route.
 *
 * Other params are carried through up to {@link MAX_CARRIED_QUERY}, so a pager
 * beside a `?tag=` does not drop it — the previous implementation concatenated
 * `?page=` onto a base URL and silently dropped the rest of the query string.
 *
 * Page 0 omits the param rather than writing `=0`, keeping the first page's URL
 * the one a reader arrived on and every other link to the route already uses.
 */
export const routePageHref = (
  searchParams: SearchParams,
  basePath: string,
  page: number,
): string => {
  const params = new URLSearchParams();
  let budget = MAX_CARRIED_QUERY;

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === PAGE_PARAM || value === undefined) {
      continue;
    }

    for (const entry of Array.isArray(value) ? value : [value]) {
      budget -= key.length + entry.length + 2;

      if (budget < 0) {
        break;
      }

      params.append(key, entry);
    }

    if (budget < 0) {
      break;
    }
  }

  if (page > 0) {
    params.set(PAGE_PARAM, String(page));
  }

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
};
