export type PageListingLayout = "news" | "events" | "products" | "profiles";

// Keyed by PAGE_TYPE as `string`: the SDK's Page["type"] union stops at NEWSLIST.
const LISTING_LAYOUT_BY_PAGE_TYPE: Partial<Record<string, PageListingLayout>> =
  {
    NEWS: "news",
    NEWSLIST: "news",
    EVENTLIST: "events",
    PRODUCTLIST: "products",
    PROFILELIST: "profiles",
  };

export const resolvePageListingLayout = (
  type: string,
): PageListingLayout | null => LISTING_LAYOUT_BY_PAGE_TYPE[type] ?? null;
