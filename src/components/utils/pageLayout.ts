export type PageListingLayout = "news" | "events" | "products";

// Keyed by PAGE_TYPE as `string`: the SDK's Page["type"] union stops at NEWSLIST.
// PROFILELIST omitted — this template has no profiles index to stand in for.
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
