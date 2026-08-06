/**
 * The query half of the listing blocks an author can drop into rich-text
 * content: it reads a block's filters off the node, calls the matching
 * endpoint, and hands the records to a component the caller supplies.
 *
 * Nothing here knows what a listing looks like. That is deliberate — this layer
 * is destined for @venuecms/sdk-next, where it has to serve every template, so
 * the components arrive as an argument the same way `contentStyles` does:
 *
 *   // once, at module scope — see the note on createListingBlocks below
 *   const blocks = createListingBlocks(listingComponents);
 *   <VenueContent components={blocks} />
 *
 * The template's own list components live in @/components/ListingBlock. The one
 * thing this layer still reaches back for is ErrorBoundary, a generic utility
 * the SDK would supply itself — not a rendering choice.
 */
import type {
  Event,
  NodeHandler,
  NodeProps,
  Product,
  Profile,
  Site,
  Page as VenuePage,
} from "@venuecms/sdk-next";
import {
  getEvents,
  getNews,
  getPages,
  getProducts,
  getProfiles,
  getSite,
} from "@venuecms/sdk-next";
import { connection } from "next/server";
import { ComponentType, Suspense } from "react";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import type { ListingBlockNodeType, NodeAttrs } from "./params";
import {
  buildEventListingQuery,
  buildNewsListingQuery,
  buildPageListingQuery,
  buildProductListingQuery,
  buildProfileListingQuery,
  minuteRoundedNow,
  parseEventListingAttributes,
  parseNewsListingAttributes,
  parsePageListingAttributes,
  parseProductListingAttributes,
  parseProfileListingAttributes,
} from "./params";

/**
 * What every injected list component receives.
 *
 * `records` may be empty: whether that renders an empty state or nothing at all
 * is a rendering decision, so it belongs to the component, not to this layer.
 */
export type ListingProps<Item> = {
  records: Item[];
  site: Site;
};

/** The record each listing node type lists. */
type ListingRecord = {
  eventListing: Event;
  newsListing: VenuePage;
  pageListing: VenuePage;
  productListing: Product;
  profileListing: Profile;
};

/**
 * The list components a caller has to supply, one per listing node type.
 *
 * Keyed off ListingBlockNodeType so the set stays exactly the contract: a key
 * that is not a listing type fails to compile rather than sitting here unused.
 */
export type ListingComponents = {
  [Type in ListingBlockNodeType]: ComponentType<
    ListingProps<ListingRecord[Type]>
  >;
};

/**
 * How one listing type turns a node's attributes into records: parse the
 * attributes, then query the endpoint they describe.
 *
 * `now` is a parameter rather than a call inside each query so the clock stays
 * out of the query builders and a test can pin it. It is read once per block,
 * at render time — two blocks in one document rendering across a minute tick
 * can still land on different windows, as they did before this layer existed.
 */
type ListingDefinition<Attrs, Item> = {
  parse: (attrs: NodeAttrs) => Attrs;
  query: (
    attrs: Attrs,
    now: number,
  ) => Promise<{ data?: { records: Item[] } | null }>;
};

/** Infers both type parameters from the definition it is handed. */
const defineListing = <Attrs, Item>(
  definition: ListingDefinition<Attrs, Item>,
) => definition;

const LISTINGS = {
  eventListing: defineListing({
    parse: parseEventListingAttributes,
    query: (attrs, now) => getEvents(buildEventListingQuery(attrs, now)),
  }),
  newsListing: defineListing({
    parse: parseNewsListingAttributes,
    query: (attrs, now) => getNews(buildNewsListingQuery(attrs, now)),
  }),
  pageListing: defineListing({
    parse: parsePageListingAttributes,
    query: (attrs) => getPages(buildPageListingQuery(attrs)),
  }),
  productListing: defineListing({
    parse: parseProductListingAttributes,
    query: (attrs) => getProducts(buildProductListingQuery(attrs)),
  }),
  profileListing: defineListing({
    parse: parseProfileListingAttributes,
    query: (attrs) => getProfiles(buildProfileListingQuery(attrs)),
  }),
};

/**
 * Attributes are only ever read through the parsers in ./params, which validate
 * every value — the renderer types a node's attribute bag loosely because a
 * TipTap node may carry anything.
 */
const nodeAttrs = (node: NodeProps["node"]): NodeAttrs => node.attrs ?? {};

/**
 * Binds one listing definition to the component that renders its records.
 *
 * The renderer's handlers are synchronous, so the fetch happens in a server
 * component the handler returns. Suspending it keeps the surrounding prose
 * streaming — a block sits mid-content, so without a boundary the whole article
 * would wait on the listing's request.
 *
 * The two boundaries cover different failures. Rendering on the server, React
 * does not run error boundaries: it is Suspense that contains a throw, falling
 * back to null and leaving the rest of the article intact. The ErrorBoundary
 * covers the client, where React retries the failed boundary — without it a
 * second failure escapes to the route's error page. Neither fires on the
 * ordinary failure, because the SDK reports a bad request in-band as empty
 * `data` rather than throwing; that reaches the component as no records.
 */
const listingBlock = <Attrs, Item>(
  { parse, query }: ListingDefinition<Attrs, Item>,
  // NoInfer matters: without it `Item` is inferred from the component as well
  // as the definition, so pairing a definition with another type's component
  // widens Item instead of failing — the five near-identical lines in
  // createListingBlocks are exactly where that slip would happen. It cannot
  // catch a news/page swap, since both list the same record; the routing test
  // is what covers that pair.
  Component: ComponentType<ListingProps<NoInfer<Item>>>,
): NodeHandler => {
  const Listing = async ({ node }: NodeProps) => {
    // A listing is request-time data, and a "past" window reads the clock —
    // both of which have to be marked dynamic before they run, or the
    // prerender bails out under cacheComponents.
    await connection();

    const [result, { data: site }] = await Promise.all([
      query(parse(nodeAttrs(node)), minuteRoundedNow()),
      getSite(),
    ]);

    // Every listing takes `site`, including the profile one that ignores it,
    // so the injected components share a single prop shape. Bailing without it
    // costs a profile listing that would once have rendered anyway — an
    // acceptable trade, since a site this template cannot read also leaves the
    // header, the theme, and every other listing on the page empty.
    if (!site) {
      return null;
    }

    return <Component records={result.data?.records ?? []} site={site} />;
  };

  return ({ node }) => (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <Listing node={node} />
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * The listing node types mapped to their handlers, ready to pass to
 * VenueContent's `components` prop.
 *
 * Returning the node-type union rather than the renderer's open-ended
 * NodeHandlers is deliberate: an unhandled type is dropped from the content
 * silently, so a block added to the contract should fail to compile until it
 * has a component.
 *
 * Call this once, at module scope. Each call mints fresh component identities,
 * so calling it inline in JSX would remount every listing — and refetch it —
 * on each render of the surrounding content.
 */
export const createListingBlocks = (
  components: ListingComponents,
): Record<ListingBlockNodeType, NodeHandler> => ({
  eventListing: listingBlock(LISTINGS.eventListing, components.eventListing),
  newsListing: listingBlock(LISTINGS.newsListing, components.newsListing),
  pageListing: listingBlock(LISTINGS.pageListing, components.pageListing),
  productListing: listingBlock(
    LISTINGS.productListing,
    components.productListing,
  ),
  profileListing: listingBlock(
    LISTINGS.profileListing,
    components.profileListing,
  ),
});
