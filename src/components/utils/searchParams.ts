import type { SearchParams } from "@venuecms/sdk-next";

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
