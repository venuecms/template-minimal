import { MAX_PAGE, type SearchParams } from "@venuecms/sdk-next";

/**
 * The page a URL is asking for: the read half of the same concern
 * `buildPageHref` writes, kept beside it so a pager's two ends cannot drift.
 *
 * The rules are the SDK's unexported `readPage`, deliberately — a listing block
 * in the page's body reads its own page out of this same query string with that
 * reader. A stricter one here does not make the URL safer; it makes the route
 * and the block disagree about which page the URL names, so the route's pager
 * builds hrefs from a page the block is not on. A digits-only test did exactly
 * that for "1e3" and for a padded " 1".
 *
 * `Number`, not `parseInt`: parseInt reads a prefix, so "12abc" would page
 * to 12. Non-integers and negatives start at the first page.
 */
export const readPage = (searchParams: SearchParams): number => {
  const raw = searchParams.page;
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (typeof value !== "string" || value.trim() === "") {
    return 0;
  }

  const parsed = Number(value);

  // Clamped rather than passed on: a hand-edited page deeper than the endpoint
  // will scan is a request it would refuse anyway.
  return Number.isInteger(parsed) && parsed >= 0
    ? Math.min(parsed, MAX_PAGE)
    : 0;
};

/**
 * A route pager's href, carrying every other param through.
 *
 * A listing block in the page's body owns a param of its own, so a pager that
 * wrote `?page=N` alone would snap that block back to its first page.
 */
export const buildPageHref = (
  basePath: string,
  searchParams: SearchParams,
  page: number,
): string => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) {
      continue;
    }

    for (const entry of Array.isArray(value) ? value : [value]) {
      params.append(key, entry);
    }
  }

  params.set("page", String(page));

  return `${basePath}?${params.toString()}`;
};
