/**
 * The dispatch half of the listing blocks an author can drop into rich-text
 * content: it recognises a listing node, reads the block's parameters off it,
 * and hands them to a component the caller supplies.
 *
 * It calls no endpoint. Rendering content must not be the thing that queries —
 * a listing entry receives the parameters and resolves its own records, so the
 * template decides what to fetch and how to lay it out:
 *
 *   // the one map a template holds, class names and listings together
 *   const contentComponents = {
 *     ...renderedStyles,
 *     eventListing: (params) => <EventListingBlock {...params} />,
 *   };
 *
 * What this layer does own is validation — an attribute an author typed is
 * untrusted input, so it is parsed into the endpoint's own param shape before
 * any entry sees it — and the boundaries, since the SDK's handlers are
 * synchronous and an entry that fetches has to suspend somewhere.
 *
 * Nothing here knows what a listing looks like or where its records come from.
 * That is deliberate: this layer is destined for @venuecms/sdk-next, where it
 * has to serve every template. The template's own listings live in
 * @/components/ListingBlock. The one thing it still reaches back for is
 * ErrorBoundary, a generic utility the SDK would supply itself — not a
 * rendering choice.
 */
import type { NodeHandler } from "@venuecms/sdk-next";
import { ReactNode, Suspense } from "react";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import type {
  EventListingAttributes,
  ListingBlockNodeType,
  NewsListingAttributes,
  NodeAttrs,
  PageListingAttributes,
  ProductListingAttributes,
  ProfileListingAttributes,
} from "./params";
import {
  parseEventListingAttributes,
  parseNewsListingAttributes,
  parsePageListingAttributes,
  parseProductListingAttributes,
  parseProfileListingAttributes,
} from "./params";

/**
 * The parameters each listing node type hands its entry.
 *
 * These are the block's filters, validated — not records. Turning them into a
 * query and calling the endpoint is the entry's job; ./params exports a builder
 * per type for that, so the entry never assembles a query by hand.
 */
export type ListingParams = {
  eventListing: EventListingAttributes;
  newsListing: NewsListingAttributes;
  pageListing: PageListingAttributes;
  productListing: ProductListingAttributes;
  profileListing: ProfileListingAttributes;
};

/**
 * What a caller puts on `contentStyles` under a listing node type.
 *
 * Returning a ReactNode rather than a Promise is what keeps this compatible
 * with the SDK's synchronous handler: an entry that fetches returns the
 * component that awaits, and this layer suspends it.
 */
export type ListingRenderer<Type extends ListingBlockNodeType> = (
  params: ListingParams[Type],
) => ReactNode;

/**
 * The entries a caller may supply, keyed by listing node type.
 *
 * Every key is optional: a template that has no way to render one listing type
 * should leave it off rather than register an entry that draws nothing. Keying
 * off ListingBlockNodeType keeps the set exactly the contract — a key that is
 * not a listing type fails to compile rather than sitting here unused.
 */
export type ListingRenderers = {
  [Type in ListingBlockNodeType]?: ListingRenderer<Type>;
};

/**
 * The same map with every listing required.
 *
 * A template that means to render all of them annotates its map with this, so
 * a listing type added to the contract fails to compile until it has an entry.
 * Without it the missing key is legal, `listingHandlers` registers nothing for
 * that type, and an author's block is dropped from the published page with only
 * a console warning.
 */
export type AllListingRenderers = {
  [Type in ListingBlockNodeType]: ListingRenderer<Type>;
};

/**
 * How each listing node type reads its parameters off the node.
 *
 * The mapped-type annotation pairs each entry with its own param shape, so a
 * node type wired to another listing's parser fails to compile here rather than
 * handing an entry filters that its endpoint does not take.
 */
const parseAttributes: {
  [Type in ListingBlockNodeType]: (attrs: NodeAttrs) => ListingParams[Type];
} = {
  eventListing: parseEventListingAttributes,
  newsListing: parseNewsListingAttributes,
  pageListing: parsePageListingAttributes,
  productListing: parseProductListingAttributes,
  profileListing: parseProfileListingAttributes,
};

/**
 * Binds one listing node type to the entry that renders it.
 *
 * The SDK's handlers are synchronous, so an entry that resolves records returns
 * a component that awaits rather than awaiting itself. Suspending it here keeps
 * the surrounding prose streaming — a block sits mid-content, so without a
 * boundary the whole article would wait on the listing's request.
 *
 * The two boundaries cover different failures. Rendering on the server, React
 * does not run error boundaries: it is Suspense that contains a throw, falling
 * back to null and leaving the rest of the article intact. The ErrorBoundary
 * covers the client, where React retries the failed boundary — without it a
 * second failure escapes to the route's error page. Neither fires on the
 * ordinary failure, because the SDK reports a bad request in-band as empty
 * `data` rather than throwing; that reaches the entry as no records.
 *
 * A node's attribute bag is typed loosely because a TipTap node may carry
 * anything, and is only ever read through the parsers, which validate it.
 */
const listingBlock =
  <Type extends ListingBlockNodeType>(
    nodeType: Type,
    render: ListingRenderer<Type>,
  ): NodeHandler =>
  ({ node }) => (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        {render(parseAttributes[nodeType](node.attrs ?? {}))}
      </Suspense>
    </ErrorBoundary>
  );

/**
 * The supplied entries wrapped into the handlers VenueContent passes to the
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

  // Spelled out per type rather than looped, so each entry keeps the param
  // shape its own key promises — iterating the node types would widen every
  // entry to the union and lose the pairing. Annotated with every node type so
  // a listing added to the contract fails to compile until it is wired here
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
