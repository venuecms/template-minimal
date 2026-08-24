import { MAX_PAGE, type SearchParams } from "@venuecms/sdk-next";

/**
 * The page a URL is asking for: the read half of the same concern
 * `buildPageHref` writes, kept beside it so a pager's two ends cannot drift.
 *
 * Anything that is not a run of digits starts at the first page rather than
 * reaching the endpoint. `Number()` would read "1e3" as the deepest offset the
 * endpoint will scan and "-2" as a negative one; `parseInt` would take "12abc"
 * for 12.
 */
export const readPage = (searchParams: SearchParams): number => {
  const raw = searchParams.page;
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return 0;
  }

  // Clamped rather than passed on: a hand-edited page deeper than the endpoint
  // will scan is a request it would refuse anyway.
  return Math.min(Number(value), MAX_PAGE);
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
