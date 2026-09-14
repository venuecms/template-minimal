export type PageListingLayout = "news" | "events" | "profiles" | "products";

// Keyed by `string`, not the SDK's `Page["type"]`: that union still stops at
// `NEWSLIST`, and an unknown type should fall through to the page layout.
//
// NEWS sits here alongside NEWSLIST because this template has always answered
// a page of that type with its news view, and this map only restates where the
// existing dispatch sent it.
const LISTING_LAYOUT_BY_PAGE_TYPE: Partial<Record<string, PageListingLayout>> =
  {
    NEWS: "news",
    NEWSLIST: "news",
    EVENTLIST: "events",
    PROFILELIST: "profiles",
    PRODUCTLIST: "products",
  };

export const resolvePageListingLayout = (
  type: string,
): PageListingLayout | null => LISTING_LAYOUT_BY_PAGE_TYPE[type] ?? null;
