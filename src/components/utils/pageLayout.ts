export type PageListingLayout = "news" | "events" | "products" | "profiles";

// Keyed by PAGE_TYPE as `string`: the SDK's Page["type"] union stops at NEWSLIST.
//
// NEWS is deliberately absent. Only NEWSLIST is the index; a NEWS record is a
// single article, and the news layout renders whichever article is newest
// rather than the one the URL named. Left here, /p/<any-news-slug> answered
// with the newest article. Off it, the page layout renders the record asked for.
const LISTING_LAYOUT_BY_PAGE_TYPE: Partial<Record<string, PageListingLayout>> =
  {
    NEWSLIST: "news",
    EVENTLIST: "events",
    PRODUCTLIST: "products",
    PROFILELIST: "profiles",
  };

export const resolvePageListingLayout = (
  type: string,
): PageListingLayout | null => LISTING_LAYOUT_BY_PAGE_TYPE[type] ?? null;
