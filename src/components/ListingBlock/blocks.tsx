/**
 * One component per listing block an author can place in rich-text content.
 *
 * Each takes the block's parameters — handed over by @/lib/listingBlocks, which
 * parsed them off the node and validated them — turns them into that endpoint's
 * query, resolves its own records, and lays them out with the same list
 * components the template uses for that record type elsewhere. So a listing
 * inside content looks like a listing anywhere else.
 *
 * These are the suspending half of a listing: the SDK's node handlers are
 * synchronous, so a block awaits here and @/lib/listingBlocks wraps it in the
 * Suspense and error boundaries. Nothing above this file fetches.
 *
 * An empty listing renders nothing. It sits mid-prose, where an empty-state
 * message would read as content the author wrote.
 */
import {
  getEvents,
  getNews,
  getPages,
  getProducts,
  getProfiles,
  getSite,
} from "@venuecms/sdk-next";
import { connection } from "next/server";

import type {
  EventListingAttributes,
  NewsListingAttributes,
  PageListingAttributes,
  ProductListingAttributes,
  ProfileListingAttributes,
} from "@/lib/listingBlocks/params";
import {
  buildEventListingQuery,
  buildNewsListingQuery,
  buildPageListingQuery,
  buildProductListingQuery,
  buildProfileListingQuery,
  minuteRoundedNow,
} from "@/lib/listingBlocks/params";

import { EventsList, ListEvent } from "@/components/EventList";
import { ListProduct } from "@/components/ListProduct";
import { ListPage, PagesList } from "@/components/PageList";
import { ProfileCompact } from "@/components/ProfileCompact";
import { TwoSubColumnLayout } from "@/components/layout";
import {
  resolveNewsArticleHref,
  resolvePageHref,
} from "@/components/utils/pageHref";

// Each block opens with `await connection()`. A listing is request-time data,
// and a "past" window reads the clock — both have to be marked dynamic before
// they run, or the prerender bails out under cacheComponents. It sits in every
// block rather than once above them because each block is its own dynamic
// boundary now that it does its own fetching.

export const EventListingBlock = async (params: EventListingAttributes) => {
  await connection();

  const [events, { data: site }] = await Promise.all([
    getEvents(buildEventListingQuery(params, minuteRoundedNow())),
    getSite(),
  ]);

  const records = events.data?.records ?? [];

  // The SDK reports a failed read as empty data rather than throwing, so
  // nothing catches it — this is the only thing keeping a siteless list off a
  // component that has `site` typed non-null.
  if (!site || !records.length) {
    return null;
  }

  return (
    <EventsList className="gap-y-12 py-4">
      {records.map((event) => (
        <ListEvent key={event.id} event={event} site={site} withImage />
      ))}
    </EventsList>
  );
};

export const NewsListingBlock = async (params: NewsListingAttributes) => {
  await connection();

  const [news, { data: site }] = await Promise.all([
    getNews(buildNewsListingQuery(params, minuteRoundedNow())),
    getSite(),
  ]);

  const records = news.data?.records ?? [];

  if (!site || !records.length) {
    return null;
  }

  return (
    <PagesList className="py-4">
      {records.map((article) => (
        <ListPage
          key={article.id}
          page={article}
          site={site}
          href={resolveNewsArticleHref(article.slug)}
          withDate
        />
      ))}
    </PagesList>
  );
};

export const PageListingBlock = async (params: PageListingAttributes) => {
  await connection();

  const [pages, { data: site }] = await Promise.all([
    getPages(buildPageListingQuery(params)),
    getSite(),
  ]);

  const records = pages.data?.records ?? [];

  if (!site || !records.length) {
    return null;
  }

  return (
    <PagesList className="py-4">
      {records.map((page) => (
        <ListPage
          key={page.id}
          page={page}
          site={site}
          {...resolvePageHref(page)}
        />
      ))}
    </PagesList>
  );
};

export const ProductListingBlock = async (params: ProductListingAttributes) => {
  await connection();

  const [products, { data: site }] = await Promise.all([
    getProducts(buildProductListingQuery(params)),
    getSite(),
  ]);

  const records = products.data?.records ?? [];

  if (!site || !records.length) {
    return null;
  }

  return (
    <div className="grid gap-8 py-4 sm:grid-cols-2 lg:grid-cols-3">
      {records.map((product) => (
        <ListProduct key={product.slug} product={product} site={site} />
      ))}
    </div>
  );
};

/**
 * The one listing that reads no site, so it does not fetch one: a profile card
 * still renders on a site this template cannot read, where the others cannot.
 */
export const ProfileListingBlock = async (params: ProfileListingAttributes) => {
  await connection();

  const { data } = await getProfiles(buildProfileListingQuery(params));
  const records = data?.records ?? [];

  if (!records.length) {
    return null;
  }

  return (
    <TwoSubColumnLayout className="py-4">
      {records.map((profile) => (
        <ProfileCompact key={profile.slug} profile={profile} />
      ))}
    </TwoSubColumnLayout>
  );
};
