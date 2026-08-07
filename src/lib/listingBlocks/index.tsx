/**
 * The query half of the listing blocks an author can drop into rich-text
 * content: it reads a block's filters off the node, calls the matching
 * endpoint, and hands the records to a render function the caller supplies.
 *
 * Nothing here knows what a listing looks like. That is deliberate — this layer
 * is destined for @venuecms/sdk-next, where it has to serve every template, so
 * the renderers arrive on `contentStyles` alongside the class names:
 *
 *   // the one map a template holds, class names and listings together
 *   const contentComponents = {
 *     ...renderedStyles,
 *     eventListing: ({ records, site }) => <EventList ... />,
 *   };
 *
 * The template's own listings live in @/components/ListingBlock. The one thing
 * this layer still reaches back for is ErrorBoundary, a generic utility the SDK
 * would supply itself — not a rendering choice.
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
import { ReactNode, Suspense } from "react";

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
 * What every listing renderer receives.
 *
 * `records` may be empty: whether that renders an empty state or nothing at all
 * is a rendering decision, so it belongs to the renderer, not to this layer.
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

/** What a caller puts on `contentStyles` under a listing node type. */
export type ListingRenderer<Type extends ListingBlockNodeType> = (
  props: ListingProps<ListingRecord[Type]>,
) => ReactNode;

/**
 * The renderers a caller may supply, keyed by listing node type.
 *
 * Every key is optional: a template that has no way to render one listing type
 * should leave it off rather than register a renderer that draws nothing.
 * Keying off ListingBlockNodeType keeps the set exactly the contract — a key
 * that is not a listing type fails to compile rather than sitting here unused.
 */
export type ListingRenderers = {
  [Type in ListingBlockNodeType]?: ListingRenderer<Type>;
};

/**
 * The same map with every listing required.
 *
 * A template that means to render all of them annotates its map with this, so
 * a listing type added to the contract fails to compile until it has a
 * renderer. Without it the missing key is legal, `listingHandlers` registers
 * nothing for that type, and an author's block is dropped from the published
 * page with only a console warning.
 */
export type AllListingRenderers = {
  [Type in ListingBlockNodeType]: ListingRenderer<Type>;
};

/**
 * How one listing type turns a node's attributes into records: parse the
 * attributes, then query the endpoint they describe.
 *
 * The mapped-type annotation pairs each entry with its own record type, so an
 * entry wired to an endpoint that lists something else fails to compile here
 * rather than reaching a renderer typed for another record. It cannot catch a
 * news/page swap, since both list the same record; the routing test is what
 * covers that pair.
 *
 * `now` is a parameter rather than a call inside each query so the clock stays
 * out of the query builders and a test can pin it. It is read once per block,
 * at render time — two blocks in one document rendering across a minute tick
 * can still land on different windows, as they did before this layer existed.
 */
const fetchRecords: {
  [Type in ListingBlockNodeType]: (
    attrs: NodeAttrs,
    now: number,
  ) => Promise<ListingRecord[Type][]>;
} = {
  eventListing: async (attrs, now) =>
    (
      await getEvents(
        buildEventListingQuery(parseEventListingAttributes(attrs), now),
      )
    ).data?.records ?? [],
  newsListing: async (attrs, now) =>
    (
      await getNews(
        buildNewsListingQuery(parseNewsListingAttributes(attrs), now),
      )
    ).data?.records ?? [],
  pageListing: async (attrs) =>
    (await getPages(buildPageListingQuery(parsePageListingAttributes(attrs))))
      .data?.records ?? [],
  productListing: async (attrs) =>
    (
      await getProducts(
        buildProductListingQuery(parseProductListingAttributes(attrs)),
      )
    ).data?.records ?? [],
  profileListing: async (attrs) =>
    (
      await getProfiles(
        buildProfileListingQuery(parseProfileListingAttributes(attrs)),
      )
    ).data?.records ?? [],
};

/**
 * Attributes are only ever read through the parsers in ./params, which validate
 * every value — the renderer types a node's attribute bag loosely because a
 * TipTap node may carry anything.
 */
const nodeAttrs = (node: NodeProps["node"]): NodeAttrs => node.attrs ?? {};

/**
 * Binds one listing node type to the function that renders its records.
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
 * `data` rather than throwing; that reaches the renderer as no records.
 */
const listingBlock = <Type extends ListingBlockNodeType>(
  nodeType: Type,
  render: ListingRenderer<Type>,
): NodeHandler => {
  const Listing = async ({ node }: NodeProps) => {
    // A listing is request-time data, and a "past" window reads the clock —
    // both of which have to be marked dynamic before they run, or the
    // prerender bails out under cacheComponents.
    await connection();

    const [records, { data: site }] = await Promise.all([
      fetchRecords[nodeType](nodeAttrs(node), minuteRoundedNow()),
      getSite(),
    ]);

    // Every listing takes `site`, including the profile one that ignores it,
    // so the renderers share a single prop shape. Bailing without it costs a
    // profile listing that would once have rendered anyway — an acceptable
    // trade, since a site this template cannot read also leaves the header,
    // the theme, and every other listing on the page empty.
    if (!site) {
      return null;
    }

    return <>{render({ records, site })}</>;
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
 * The supplied renderers wrapped into the handlers VenueContent passes to the
 * SDK's `components` prop.
 *
 * A listing left off the map is left unregistered rather than given a handler
 * that renders nothing, so the SDK keeps whatever it would do with that node.
 *
 * Built per render rather than memoised: the SDK's renderer resolves to the
 * server build under the app router (only its CJS entry is "use client"), so
 * the handlers are minted once per request and the fresh component identities
 * never reach a client reconciliation that could remount them.
 */
export const listingHandlers = (
  renderers: ListingRenderers,
): Record<string, NodeHandler> => {
  const build = <Type extends ListingBlockNodeType>(
    nodeType: Type,
    render: ListingRenderer<Type> | undefined,
  ) => (render ? listingBlock(nodeType, render) : undefined);

  // Spelled out per type rather than looped, so each renderer keeps the record
  // type its own key promises — iterating the node types would widen every
  // renderer to the union and lose the pairing. Annotated with every node type
  // so a listing added to the contract fails to compile until it is wired here
  // too; a bare list of calls would let it ship unregistered.
  const handlers: Record<ListingBlockNodeType, NodeHandler | undefined> = {
    eventListing: build("eventListing", renderers.eventListing),
    newsListing: build("newsListing", renderers.newsListing),
    pageListing: build("pageListing", renderers.pageListing),
    productListing: build("productListing", renderers.productListing),
    profileListing: build("profileListing", renderers.profileListing),
  };

  return Object.fromEntries(
    Object.entries(handlers).filter(
      (entry): entry is [string, NodeHandler] => entry[1] !== undefined,
    ),
  );
};
