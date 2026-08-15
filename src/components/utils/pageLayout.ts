/**
 * Which listing, if any, a page's type stands in for.
 *
 * A page can be marked in the CMS as the site's news / events / products index.
 * Such a page renders that listing rather than its own content, so an author
 * can put the index anywhere in the page tree — and so the listing looks the
 * same whether a reader arrives at `/events` or at a page slugged something
 * else entirely.
 */
export type PageListingLayout = "news" | "events" | "products";

/**
 * Keyed by the CMS's `PAGE_TYPE`, and typed against `string` rather than the
 * SDK's `Page["type"]` on purpose: that union is generated from the API schema
 * and still stops at `NEWSLIST`, so naming the list types here would not
 * compile. A lookup is also what makes the unknown case free — a page type
 * added to the CMS after this template shipped falls through to the page layout
 * instead of blanking the page.
 *
 * `PROFILELIST` is absent for a different reason: the platform has the type,
 * but this template has no profiles index to point it at — profiles appear as
 * `/artists/<slug>` and as a listing block inside content, never as a route of
 * their own. Such a page keeps its own content until there is one.
 */
const LISTING_LAYOUT_BY_PAGE_TYPE: Partial<Record<string, PageListingLayout>> =
  {
    NEWS: "news",
    NEWSLIST: "news",
    EVENTLIST: "events",
    PRODUCTLIST: "products",
  };

export const resolvePageListingLayout = (
  type: string,
): PageListingLayout | null => LISTING_LAYOUT_BY_PAGE_TYPE[type] ?? null;
