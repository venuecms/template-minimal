/**
 * The listing blocks' attribute contract, as read by this template.
 *
 * The platform's editor can drop an event/news/page/product/profile listing
 * into any rich-text content. Each block serializes the query params of its
 * public endpoint so a consumer can rebuild the API call, and it reaches us in
 * one of two shapes:
 *
 * - as a node in `contentJSON`, whose `attrs` use the block's own camelCase
 *   param names (`limit`, `orderBy`, `listingType`, …);
 * - as a `<div data-type="event-listing" data-limit="4" …>` in the markdown
 *   fallback, whose attributes are the `data-*` serialization.
 *
 * Both name the same params, so every reader below accepts either and every
 * value is validated here rather than trusted — an author-editable attribute
 * is untrusted input, and a bad one should drop out of the query instead of
 * reaching the endpoint.
 */
import type {
  getEvents,
  getNews,
  getPages,
  getProducts,
  getProfiles,
} from "@venuecms/sdk-next";

/** Every TipTap node type this template renders as a listing. */
export const LISTING_BLOCK_NODE_TYPES = [
  "eventListing",
  "newsListing",
  "pageListing",
  "productListing",
  "profileListing",
] as const;

export type ListingBlockNodeType = (typeof LISTING_BLOCK_NODE_TYPES)[number];

type NodeAttrs = Record<string, unknown>;

type Dir = "asc" | "desc";

const DIRS = ["asc", "desc"] as const;

const EVENT_ORDER_BY = ["startDate", "createdAt", "updatedAt"] as const;
const NEWS_ORDER_BY = ["date", "order", "createdAt", "updatedAt"] as const;
const PAGE_ORDER_BY = ["createdAt", "updatedAt"] as const;
const PRODUCT_ORDER_BY = ["order", "createdAt", "updatedAt"] as const;
const PROFILE_ORDER_BY = ["slug", "createdAt", "updatedAt"] as const;

const EVENT_LISTING_TYPES = ["upcoming", "past", "all"] as const;
const NEWS_LISTING_TYPES = ["all", "upcoming", "past"] as const;

const PROFILE_TYPES = ["member"] as const;

type EventListingType = (typeof EVENT_LISTING_TYPES)[number];
type NewsListingType = (typeof NEWS_LISTING_TYPES)[number];

// Query shapes are read off the SDK's own signatures, so a param the endpoint
// drops or renames surfaces here as a type error rather than a silent no-op.
type EventsQuery = NonNullable<Parameters<typeof getEvents>[0]>;
type NewsQuery = NonNullable<Parameters<typeof getNews>[0]>;
type PagesQuery = NonNullable<Parameters<typeof getPages>[0]>;
type ProductsQuery = NonNullable<Parameters<typeof getProducts>[0]>;
type ProfilesQuery = NonNullable<Parameters<typeof getProfiles>[0]>;

/**
 * Reads one param under either name. Only one shape is ever present, so the
 * `data-*` spelling simply wins when both somehow are.
 */
const readAttr = (
  attrs: NodeAttrs,
  name: string,
  dataName: string,
): unknown => {
  const dataValue = attrs[dataName];
  return dataValue !== undefined && dataValue !== null
    ? dataValue
    : attrs[name];
};

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

const toTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter(
      (tag): tag is string => typeof tag === "string" && !!tag,
    );
  }

  return typeof value === "string" ? value.split(",").filter(Boolean) : [];
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

export type EventListingAttributes = {
  listingType: EventListingType;
  limit: number | null;
  page: number | null;
  orderBy: (typeof EVENT_ORDER_BY)[number] | null;
  dir: Dir | null;
  featured: boolean;
  rootOnly: boolean;
  tags: string[];
  query: string | null;
  lt: number | null;
  gt: number | null;
  legacyId: string | null;
};

export const parseEventListingAttributes = (
  attrs: NodeAttrs,
): EventListingAttributes => ({
  listingType:
    toOption(
      readAttr(attrs, "listingType", "data-listing-type"),
      EVENT_LISTING_TYPES,
    ) ?? "upcoming",
  limit: toNumber(readAttr(attrs, "limit", "data-limit"), isValidLimit),
  page: toNumber(readAttr(attrs, "page", "data-page"), isValidPage),
  orderBy: toOption(
    readAttr(attrs, "orderBy", "data-order-by"),
    EVENT_ORDER_BY,
  ),
  dir: toOption(readAttr(attrs, "dir", "data-dir"), DIRS),
  featured: toFlag(readAttr(attrs, "featured", "data-featured")),
  rootOnly: toFlag(readAttr(attrs, "rootOnly", "data-root-only")),
  tags: toTags(readAttr(attrs, "tags", "data-tags")),
  query: toText(readAttr(attrs, "query", "data-query")),
  lt: toNumber(readAttr(attrs, "lt", "data-lt"), isValidTimestamp),
  gt: toNumber(readAttr(attrs, "gt", "data-gt"), isValidTimestamp),
  legacyId: toText(readAttr(attrs, "legacyId", "data-legacy-id")),
});

/**
 * `listingType` is the one attribute that is not a param: the endpoint takes a
 * time window, so "past" becomes `lt=<now>` computed at render time and
 * "upcoming" becomes the `upcoming` flag. "all" applies no window.
 */
export const buildEventListingQuery = (
  attrs: EventListingAttributes,
  now: number,
): EventsQuery =>
  compact({
    upcoming: attrs.listingType === "upcoming" ? true : undefined,
    lt: optional(
      attrs.listingType === "past" && attrs.lt == null ? now : attrs.lt,
    ),
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
  });

export type NewsListingAttributes = {
  listingType: NewsListingType;
  limit: number | null;
  page: number | null;
  orderBy: (typeof NEWS_ORDER_BY)[number] | null;
  dir: Dir | null;
  featured: boolean;
  tags: string[];
  query: string | null;
  lt: number | null;
  gt: number | null;
};

export const parseNewsListingAttributes = (
  attrs: NodeAttrs,
): NewsListingAttributes => ({
  listingType:
    toOption(
      readAttr(attrs, "listingType", "data-listing-type"),
      NEWS_LISTING_TYPES,
    ) ?? "all",
  limit: toNumber(readAttr(attrs, "limit", "data-limit"), isValidLimit),
  page: toNumber(readAttr(attrs, "page", "data-page"), isValidPage),
  orderBy: toOption(readAttr(attrs, "orderBy", "data-order-by"), NEWS_ORDER_BY),
  dir: toOption(readAttr(attrs, "dir", "data-dir"), DIRS),
  featured: toFlag(readAttr(attrs, "featured", "data-featured")),
  tags: toTags(readAttr(attrs, "tags", "data-tags")),
  query: toText(readAttr(attrs, "query", "data-query")),
  lt: toNumber(readAttr(attrs, "lt", "data-lt"), isValidTimestamp),
  gt: toNumber(readAttr(attrs, "gt", "data-gt"), isValidTimestamp),
});

export const buildNewsListingQuery = (
  attrs: NewsListingAttributes,
  now: number,
): NewsQuery =>
  compact({
    upcoming: attrs.listingType === "upcoming" ? true : undefined,
    lt: optional(
      attrs.listingType === "past" && attrs.lt == null ? now : attrs.lt,
    ),
    gt: optional(attrs.gt),
    limit: optional(attrs.limit),
    page: optional(attrs.page),
    orderBy: optional(attrs.orderBy),
    dir: optional(attrs.dir),
    featured: optionalFlag(attrs.featured),
    tags: optionalTags(attrs.tags),
    query: optional(attrs.query),
  });

export type PageListingAttributes = {
  orderBy: (typeof PAGE_ORDER_BY)[number] | null;
  dir: Dir | null;
  featured: boolean;
  tags: string[];
  query: string | null;
};

/**
 * The pages block carries no `limit`/`page`: the pages read returns every page
 * so parent paths resolve, and paginating it would promise a page size the
 * endpoint silently ignores.
 */
export const parsePageListingAttributes = (
  attrs: NodeAttrs,
): PageListingAttributes => ({
  orderBy: toOption(readAttr(attrs, "orderBy", "data-order-by"), PAGE_ORDER_BY),
  dir: toOption(readAttr(attrs, "dir", "data-dir"), DIRS),
  featured: toFlag(readAttr(attrs, "featured", "data-featured")),
  tags: toTags(readAttr(attrs, "tags", "data-tags")),
  query: toText(readAttr(attrs, "query", "data-query")),
});

export const buildPageListingQuery = (
  attrs: PageListingAttributes,
): PagesQuery =>
  compact({
    orderBy: optional(attrs.orderBy),
    dir: optional(attrs.dir),
    featured: optionalFlag(attrs.featured),
    tags: optionalTags(attrs.tags),
    query: optional(attrs.query),
  });

export type ProductListingAttributes = {
  limit: number | null;
  page: number | null;
  orderBy: (typeof PRODUCT_ORDER_BY)[number] | null;
  dir: Dir | null;
  tags: string[];
  query: string | null;
};

export const parseProductListingAttributes = (
  attrs: NodeAttrs,
): ProductListingAttributes => ({
  limit: toNumber(readAttr(attrs, "limit", "data-limit"), isValidLimit),
  page: toNumber(readAttr(attrs, "page", "data-page"), isValidPage),
  orderBy: toOption(
    readAttr(attrs, "orderBy", "data-order-by"),
    PRODUCT_ORDER_BY,
  ),
  dir: toOption(readAttr(attrs, "dir", "data-dir"), DIRS),
  tags: toTags(readAttr(attrs, "tags", "data-tags")),
  query: toText(readAttr(attrs, "query", "data-query")),
});

export const buildProductListingQuery = (
  attrs: ProductListingAttributes,
): ProductsQuery =>
  compact({
    limit: optional(attrs.limit),
    page: optional(attrs.page),
    orderBy: optional(attrs.orderBy),
    dir: optional(attrs.dir),
    tags: optionalTags(attrs.tags),
    query: optional(attrs.query),
  });

export type ProfileListingAttributes = {
  limit: number | null;
  page: number | null;
  orderBy: (typeof PROFILE_ORDER_BY)[number] | null;
  dir: Dir | null;
  type: (typeof PROFILE_TYPES)[number] | null;
  tags: string[];
  query: string | null;
};

export const parseProfileListingAttributes = (
  attrs: NodeAttrs,
): ProfileListingAttributes => ({
  limit: toNumber(readAttr(attrs, "limit", "data-limit"), isValidLimit),
  page: toNumber(readAttr(attrs, "page", "data-page"), isValidPage),
  orderBy: toOption(
    readAttr(attrs, "orderBy", "data-order-by"),
    PROFILE_ORDER_BY,
  ),
  dir: toOption(readAttr(attrs, "dir", "data-dir"), DIRS),
  // Not `data-type`: that attribute marks the node itself for TipTap's parser,
  // so the block serializes its own `type` param under `data-profile-type`.
  type: toOption(readAttr(attrs, "type", "data-profile-type"), PROFILE_TYPES),
  tags: toTags(readAttr(attrs, "tags", "data-tags")),
  query: toText(readAttr(attrs, "query", "data-query")),
});

export const buildProfileListingQuery = (
  attrs: ProfileListingAttributes,
): ProfilesQuery =>
  compact({
    limit: optional(attrs.limit),
    page: optional(attrs.page),
    orderBy: optional(attrs.orderBy),
    dir: optional(attrs.dir),
    type: optional(attrs.type),
    tags: optionalTags(attrs.tags),
    query: optional(attrs.query),
  });

/**
 * Now, rounded down to the minute. A listing windowed on "now" would otherwise
 * miss the request-level cache on every render.
 */
export const minuteRoundedNow = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.getTime();
};
