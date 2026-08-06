/**
 * Renders the listing blocks an author can drop into rich-text content.
 *
 * The platform's editor serializes each block's filters as node attributes
 * (see ./params); this module turns those into the matching SDK call and hands
 * the records to the list component the template already uses for that record
 * type, so a listing inside content looks like a listing anywhere else.
 */
import type { NodeHandler, NodeProps, RenderNode } from "@venuecms/sdk-next";
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

import { EventsList, ListEvent } from "@/components/EventList";
import { ListProduct } from "@/components/ListProduct";
import { ListPage, PagesList } from "@/components/PageList";
import { ProfileCompact } from "@/components/ProfileCompact";
import { TwoSubColumnLayout } from "@/components/layout";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import type { ListingBlockNodeType } from "./params";
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
 * Attributes are only ever read through the parsers in ./params, which
 * validate every value — the SDK types the node's attribute bag loosely
 * because a TipTap node may carry anything.
 */
const nodeAttrs = (node: RenderNode): Record<string, unknown> =>
  node.attrs ?? {};

const EventListingBlock = async ({ node }: NodeProps) => {
  // A listing is request-time data, and the "past" window reads the clock —
  // both of which have to be marked dynamic before they run, or the prerender
  // bails out under cacheComponents.
  await connection();

  const attrs = parseEventListingAttributes(nodeAttrs(node));

  const [{ data: events }, { data: site }] = await Promise.all([
    getEvents(buildEventListingQuery(attrs, minuteRoundedNow())),
    getSite(),
  ]);

  // An empty listing renders nothing: it sits mid-prose, where an empty-state
  // message would read as content the author wrote. A failed one is caught by
  // the ErrorBoundary in listingBlock() below, to the same effect.
  if (!site || !events?.records.length) {
    return null;
  }

  return (
    <EventsList className="gap-y-12 py-4">
      {events.records.map((event) => (
        <ListEvent key={event.id} event={event} site={site} withImage />
      ))}
    </EventsList>
  );
};

const NewsListingBlock = async ({ node }: NodeProps) => {
  await connection();

  const attrs = parseNewsListingAttributes(nodeAttrs(node));

  const [{ data: news }, { data: site }] = await Promise.all([
    getNews(buildNewsListingQuery(attrs, minuteRoundedNow())),
    getSite(),
  ]);

  if (!site || !news?.records.length) {
    return null;
  }

  return (
    <PagesList className="py-4">
      {news.records.map((article) => (
        <ListPage key={article.id} page={article} site={site} withDate />
      ))}
    </PagesList>
  );
};

const PageListingBlock = async ({ node }: NodeProps) => {
  await connection();

  const attrs = parsePageListingAttributes(nodeAttrs(node));

  const [{ data: pages }, { data: site }] = await Promise.all([
    getPages(buildPageListingQuery(attrs)),
    getSite(),
  ]);

  if (!site || !pages?.records.length) {
    return null;
  }

  return (
    <PagesList className="py-4">
      {pages.records.map((page) => (
        <ListPage key={page.id} page={page} site={site} />
      ))}
    </PagesList>
  );
};

const ProductListingBlock = async ({ node }: NodeProps) => {
  await connection();

  const attrs = parseProductListingAttributes(nodeAttrs(node));

  const [{ data: products }, { data: site }] = await Promise.all([
    getProducts(buildProductListingQuery(attrs)),
    getSite(),
  ]);

  if (!site || !products?.records.length) {
    return null;
  }

  return (
    <div className="grid gap-8 py-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.records.map((product) => (
        <ListProduct key={product.slug} product={product} site={site} />
      ))}
    </div>
  );
};

const ProfileListingBlock = async ({ node }: NodeProps) => {
  await connection();

  const attrs = parseProfileListingAttributes(nodeAttrs(node));
  const { data: profiles } = await getProfiles(buildProfileListingQuery(attrs));

  if (!profiles?.records.length) {
    return null;
  }

  return (
    <TwoSubColumnLayout className="py-4">
      {profiles.records.map((profile) => (
        <ProfileCompact key={profile.slug} profile={profile} />
      ))}
    </TwoSubColumnLayout>
  );
};

/**
 * Adapts a block to the renderer's synchronous handler signature.
 *
 * The handler cannot fetch: it has to return an element the renderer then
 * awaits. Suspending it separately keeps the surrounding prose streaming — a
 * block sits mid-content, so without a boundary the whole article would wait
 * on the listing's request. The ErrorBoundary is what keeps a listing that
 * throws from taking the article down with it; Suspense does not catch errors.
 */
const listingBlock =
  (Block: (props: NodeProps) => Promise<ReactNode>): NodeHandler =>
  ({ node }) => (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <Block node={node} />
      </Suspense>
    </ErrorBoundary>
  );

/**
 * The listing node types, mapped to their renderer. Pass as `components` to
 * VenueContent so the blocks resolve wherever content is rendered.
 *
 * Keyed by the node-type union rather than typed as the renderer's open-ended
 * NodeHandlers: an unhandled type is dropped from the content silently, so a
 * block added to the contract should fail to compile until it renders.
 */
export const listingBlockComponents: Record<ListingBlockNodeType, NodeHandler> =
  {
    eventListing: listingBlock(EventListingBlock),
    newsListing: listingBlock(NewsListingBlock),
    pageListing: listingBlock(PageListingBlock),
    productListing: listingBlock(ProductListingBlock),
    profileListing: listingBlock(ProfileListingBlock),
  };
