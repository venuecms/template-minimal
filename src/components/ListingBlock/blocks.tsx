/**
 * One component per listing block an author can place in rich-text content.
 *
 * Each is handed the block's records already resolved: the SDK's content
 * renderer parses the block's filters off the node, validates them, calls that
 * endpoint and suspends the result. All that is left here is layout, done with
 * the same list components the template uses for that record type elsewhere —
 * so a listing inside content looks like a listing anywhere else.
 *
 * Nothing here fetches or awaits. These are plain functions of their props,
 * which is why they need no Suspense or error boundary of their own.
 *
 * An empty listing renders nothing. It sits mid-prose, where an empty-state
 * message would read as content the author wrote.
 */
import type { ListingProps } from "@venuecms/sdk-next";

import { EventsList, ListEvent } from "@/components/EventList";
import { ListProduct } from "@/components/ListProduct";
import { ListPage, PagesList } from "@/components/PageList";
import { ProfileCompact } from "@/components/ProfileCompact";
import { TwoSubColumnLayout } from "@/components/layout";
import {
  resolveNewsArticleHref,
  resolvePageHref,
} from "@/components/utils/pageHref";

export const EventListingBlock = ({
  records,
  site,
}: ListingProps<"eventListing">) => {
  // `site` arrives nullable because the SDK reports a failed read as absent
  // data rather than throwing, so nothing catches it. Gating on it is the only
  // thing keeping a siteless record off a list component that types it
  // non-null. The record check is belt-and-braces: the SDK already renders
  // nothing in place of an empty listing rather than calling this.
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

export const NewsListingBlock = ({
  records,
  site,
}: ListingProps<"newsListing">) => {
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

export const PageListingBlock = ({
  records,
  site,
}: ListingProps<"pageListing">) => {
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

export const ProductListingBlock = ({
  records,
  site,
}: ListingProps<"productListing">) => {
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
 * The one listing that needs no site to draw, so it ignores the one it is
 * handed: a profile card still renders on a site this template could not read,
 * where the others bail out.
 *
 * That is a weaker guarantee than it was when this block did its own fetching
 * and simply never asked for a site. The SDK resolves records and site together
 * for every listing type, so a site read that rejects outright takes the
 * profiles down with it.
 */
export const ProfileListingBlock = ({
  records,
}: ListingProps<"profileListing">) => {
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
