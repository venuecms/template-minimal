/**
 * The listing blocks' attribute contract.
 *
 * The platform's editor can drop an event/news/page/product/profile listing
 * into any rich-text content. Each block serializes the query params of its
 * public endpoint, and reaches us as a node in `contentJSON` whose `attrs`
 * carry the block's own param names.
 *
 * (A block also serializes itself to `<div data-type="event-listing"
 * data-limit="4" …>` in the markdown fallback, but the SDK renderer only
 * dispatches to custom components on the `contentJSON` path — its markdown
 * path goes through markdown-to-jsx with tag-keyed overrides and never sees
 * these node types. Reading the `data-*` spelling here would be dead code;
 * supporting that path needs an SDK change first.)
 *
 * Values are validated rather than trusted: an author-editable attribute is
 * untrusted input, and a bad one should drop out of the query instead of
 * reaching the endpoint.
 */
import type {
  getEvents,
  getNews,
  getPages,
  getProducts,
  getProfiles,
} from "@venuecms/sdk-next";

/** Every TipTap node type rendered as a listing. */
export const LISTING_BLOCK_NODE_TYPES = [
  "eventListing",
  "newsListing",
  "pageListing",
  "productListing",
  "profileListing",
] as const;

export type ListingBlockNodeType = (typeof LISTING_BLOCK_NODE_TYPES)[number];

export type NodeAttrs = Record<string, unknown>;

type Dir = "asc" | "desc";

const DIRS = ["asc", "desc"] as const;

const EVENT_ORDER_BY = ["startDate", "createdAt", "updatedAt"] as const;
const NEWS_ORDER_BY = ["date", "order", "createdAt", "updatedAt"] as const;
const PAGE_ORDER_BY = ["createdAt", "updatedAt"] as const;
const PRODUCT_ORDER_BY = ["order", "createdAt", "updatedAt"] as const;
const PROFILE_ORDER_BY = ["slug", "createdAt", "updatedAt"] as const;

const LISTING_TYPES = ["upcoming", "past", "all"] as const;

const PROFILE_TYPES = ["member"] as const;

type ListingType = (typeof LISTING_TYPES)[number];

// Query shapes are read off the SDK's own signatures, so a param the endpoint
// drops or renames surfaces as a type error rather than a silent no-op. The
// guard is the annotated local in each builder below: an object literal
// assigned to an annotated target gets excess-property checked, and that is
// what catches a param the endpoint no longer has. Returning the literal
// straight out of the generic `compact` erases the check — don't.
type EventsQuery = NonNullable<Parameters<typeof getEvents>[0]>;
type NewsQuery = NonNullable<Parameters<typeof getNews>[0]>;
type PagesQuery = NonNullable<Parameters<typeof getPages>[0]>;
type ProductsQuery = NonNullable<Parameters<typeof getProducts>[0]>;
type ProfilesQuery = NonNullable<Parameters<typeof getProfiles>[0]>;

// `limit=0` is falsy server-side — `take` drops out of the pagination and the
// endpoint returns every record — so only positive limits are representable.
const isValidLimit = (value: number) => Number.isInteger(value) && value >= 1;
const isValidPage = (value: number) => Number.isInteger(value) && value >= 0;
const isValidTimestamp = (value: number) =>
  Number.isInteger(value) && value > 0;

const toNumber = (
  value: unknown,
  isValid: (value: number) => boolean,
): number | null => {
  if (typeof value === "number") {
    return isValid(value) ? value : null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && isValid(parsed) ? parsed : null;
};

const toFlag = (value: unknown): boolean => value === true || value === "true";

const toText = (value: unknown): string | null =>
  typeof value === "string" && value !== "" ? value : null;

// Tags are trimmed: a comma-separated list an author typed by hand ("jazz,
// live") would otherwise send a space-prefixed tag that matches no record and
// silently empty the listing.
const toTags = (value: unknown): string[] => {
  const tags = Array.isArray(value)
    ? value.filter((tag): tag is string => typeof tag === "string")
    : typeof value === "string"
      ? value.split(",")
      : [];

  return tags.map((tag) => tag.trim()).filter(Boolean);
};

const toOption = <T extends string>(
  value: unknown,
  options: readonly T[],
): T | null => options.find((option) => option === value) ?? null;

/** Drops the params an author left unset so they never reach the endpoint. */
const compact = <T extends object>(query: T): T =>
  Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined),
  ) as T;

const optional = <T>(value: T | null): T | undefined => value ?? undefined;

/** A flag only narrows a listing, so an unset one is omitted rather than sent. */
const optionalFlag = (value: boolean): true | undefined =>
  value ? true : undefined;

const optionalTags = (tags: string[]): string[] | undefined =>
  tags.length ? tags : undefined;

/** The filters every block shares; only the sortable columns differ. */
type CommonFilters<Column extends string> = {
  orderBy: Column | null;
  dir: Dir | null;
  tags: string[];
  query: string | null;
};

const parseCommonFilters = <Column extends string>(
  attrs: NodeAttrs,
  columns: readonly Column[],
): CommonFilters<Column> => ({
  orderBy: toOption(attrs.orderBy, columns),
  dir: toOption(attrs.dir, DIRS),
  tags: toTags(attrs.tags),
  query: toText(attrs.query),
});

type Pagination = { limit: number | null; page: number | null };

const parsePagination = (attrs: NodeAttrs): Pagination => ({
  limit: toNumber(attrs.limit, isValidLimit),
  page: toNumber(attrs.page, isValidPage),
});

/**
 * The `lt` bound a listing type implies: "past" means before now unless the
 * author pinned an explicit bound, while "upcoming" and "all" leave it open.
 * Shared by the two blocks that take a time window so they cannot drift on
 * what "past" means.
 */
const resolveListingLt = (
  listingType: ListingType,
  lt: number | null,
  now: number,
): number | undefined =>
  optional(listingType === "past" && lt == null ? now : lt);

export type EventListingAttributes = CommonFilters<
  (typeof EVENT_ORDER_BY)[number]
> &
  Pagination & {
    listingType: ListingType;
    featured: boolean;
    rootOnly: boolean;
    lt: number | null;
    gt: number | null;
    legacyId: string | null;
  };

export const parseEventListingAttributes = (
  attrs: NodeAttrs,
): EventListingAttributes => ({
  ...parseCommonFilters(attrs, EVENT_ORDER_BY),
  ...parsePagination(attrs),
  listingType: toOption(attrs.listingType, LISTING_TYPES) ?? "upcoming",
  featured: toFlag(attrs.featured),
  rootOnly: toFlag(attrs.rootOnly),
  lt: toNumber(attrs.lt, isValidTimestamp),
  gt: toNumber(attrs.gt, isValidTimestamp),
  legacyId: toText(attrs.legacyId),
});

/**
 * `listingType` is the one attribute that is not a param: the endpoint takes a
 * time window, so "past" becomes `lt=<now>` resolved at render time and
 * "upcoming" becomes the `upcoming` flag. "all" applies no window.
 */
export const buildEventListingQuery = (
  attrs: EventListingAttributes,
  now: number,
): EventsQuery => {
  const query: EventsQuery = {
    upcoming: attrs.listingType === "upcoming" ? true : undefined,
    lt: resolveListingLt(attrs.listingType, attrs.lt, now),
    gt: optional(attrs.gt),
    limit: optional(attrs.limit),
    page: optional(attrs.page),
    orderBy: optional(attrs.orderBy),
    dir: optional(attrs.dir),
    featured: optionalFlag(attrs.featured),
    rootOnly: optionalFlag(attrs.rootOnly),
    tags: optionalTags(attrs.tags),
    query: optional(attrs.query),
    legacyId: optional(attrs.legacyId),
  };

  return compact(query);
};

export type NewsListingAttributes = CommonFilters<
  (typeof NEWS_ORDER_BY)[number]
> &
  Pagination & {
    listingType: ListingType;
    featured: boolean;
    lt: number | null;
    gt: number | null;
  };

export const parseNewsListingAttributes = (
  attrs: NodeAttrs,
): NewsListingAttributes => ({
  ...parseCommonFilters(attrs, NEWS_ORDER_BY),
  ...parsePagination(attrs),
  // Unlike events, a news listing shows every article by default.
  listingType: toOption(attrs.listingType, LISTING_TYPES) ?? "all",
  featured: toFlag(attrs.featured),
  lt: toNumber(attrs.lt, isValidTimestamp),
  gt: toNumber(attrs.gt, isValidTimestamp),
});

export const buildNewsListingQuery = (
  attrs: NewsListingAttributes,
  now: number,
): NewsQuery => {
  const query: NewsQuery = {
    upcoming: attrs.listingType === "upcoming" ? true : undefined,
    lt: resolveListingLt(attrs.listingType, attrs.lt, now),
    gt: optional(attrs.gt),
    limit: optional(attrs.limit),
    page: optional(attrs.page),
    orderBy: optional(attrs.orderBy),
    dir: optional(attrs.dir),
    featured: optionalFlag(attrs.featured),
    tags: optionalTags(attrs.tags),
    query: optional(attrs.query),
  };

  return compact(query);
};

/**
 * The pages block has no `limit`/`page` and never serializes them, so there is
 * nothing to read here. The endpoint's schema does accept both, but the pages
 * read applies them only to news listings — regular pages must all come back
 * for parent-path resolution — so the editor deliberately omits them rather
 * than offer a page size the API drops.
 */
export type PageListingAttributes = CommonFilters<
  (typeof PAGE_ORDER_BY)[number]
> & {
  featured: boolean;
};

export const parsePageListingAttributes = (
  attrs: NodeAttrs,
): PageListingAttributes => ({
  ...parseCommonFilters(attrs, PAGE_ORDER_BY),
  featured: toFlag(attrs.featured),
});

export const buildPageListingQuery = (
  attrs: PageListingAttributes,
): PagesQuery => {
  const query: PagesQuery = {
    orderBy: optional(attrs.orderBy),
    dir: optional(attrs.dir),
    featured: optionalFlag(attrs.featured),
    tags: optionalTags(attrs.tags),
    query: optional(attrs.query),
  };

  return compact(query);
};

export type ProductListingAttributes = CommonFilters<
  (typeof PRODUCT_ORDER_BY)[number]
> &
  Pagination;

export const parseProductListingAttributes = (
  attrs: NodeAttrs,
): ProductListingAttributes => ({
  ...parseCommonFilters(attrs, PRODUCT_ORDER_BY),
  ...parsePagination(attrs),
});

export const buildProductListingQuery = (
  attrs: ProductListingAttributes,
): ProductsQuery => {
  const query: ProductsQuery = {
    limit: optional(attrs.limit),
    page: optional(attrs.page),
    orderBy: optional(attrs.orderBy),
    dir: optional(attrs.dir),
    tags: optionalTags(attrs.tags),
    query: optional(attrs.query),
  };

  return compact(query);
};

export type ProfileListingAttributes = CommonFilters<
  (typeof PROFILE_ORDER_BY)[number]
> &
  Pagination & {
    type: (typeof PROFILE_TYPES)[number] | null;
  };

export const parseProfileListingAttributes = (
  attrs: NodeAttrs,
): ProfileListingAttributes => ({
  ...parseCommonFilters(attrs, PROFILE_ORDER_BY),
  ...parsePagination(attrs),
  type: toOption(attrs.type, PROFILE_TYPES),
});

export const buildProfileListingQuery = (
  attrs: ProfileListingAttributes,
): ProfilesQuery => {
  const query: ProfilesQuery = {
    limit: optional(attrs.limit),
    page: optional(attrs.page),
    orderBy: optional(attrs.orderBy),
    dir: optional(attrs.dir),
    type: optional(attrs.type),
    tags: optionalTags(attrs.tags),
    query: optional(attrs.query),
  };

  return compact(query);
};

/**
 * Now, rounded down to the minute.
 *
 * The SDK reads through fetch with a revalidate window, keyed by URL, so an
 * `lt` that ticks every second would give every request a URL the data cache
 * has never seen. Rounding keeps the window stable between renders.
 */
export const minuteRoundedNow = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.getTime();
};
