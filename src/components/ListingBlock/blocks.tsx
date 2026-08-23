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
 * The four listings the endpoints page also get a `pagination`, and draw the
 * pager under their records. Pages are the exception: that block returns every
 * record because parent-path resolution needs them all, so it has no pagination
 * on its props at all rather than one that is always null.
 *
 * A listing with nothing to show renders nothing — it sits mid-prose, where an
 * empty-state message would read as content the author wrote. The one exception
 * is a reader who paged past the end, who keeps a link back; see
 * `PaginatedListing`, which owns that rule for all four.
 *
 * A block whose site read failed renders nothing at all, pager included: it
 * cannot draw a record without the site, and a lone pair of arrows in a hole
 * mid-article is worse than a clean gap. `ProfileListingBlock` needs no site,
 * so it is the one block that keeps its pager in that case.
 */
import type { ListingProps } from "@venuecms/sdk-next";

import { EventsList, ListEvent } from "@/components/EventList";
import { ListProduct } from "@/components/ListProduct";
import { ListPage, PagesList } from "@/components/PageList";
import { ProfilesList } from "@/components/ProfileList";
import {
  resolveNewsArticleHref,
  resolvePageHref,
} from "@/components/utils/pageHref";

import { PaginatedListing } from "./ListingPager";

export const EventListingBlock = ({
  records,
  site,
  pagination,
}: ListingProps<"eventListing">) => {
  // `site` arrives nullable because the SDK reports a failed read as absent
  // data rather than throwing, so nothing catches it. Gating on it is the only
  // thing keeping a siteless record off a list component that types it
  // non-null.
  if (!site) {
    return null;
  }

  return (
    <PaginatedListing pagination={pagination} records={records} label="Events">
      <EventsList className="gap-y-12 py-4">
        {records.map((event) => (
          <ListEvent key={event.id} event={event} site={site} withImage />
        ))}
      </EventsList>
    </PaginatedListing>
  );
};

export const NewsListingBlock = ({
  records,
  site,
  pagination,
}: ListingProps<"newsListing">) => {
  if (!site) {
    return null;
  }

  return (
    <PaginatedListing pagination={pagination} records={records} label="News">
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
    </PaginatedListing>
  );
};

/**
 * The one listing that does not paginate: the pages endpoint applies no
 * `limit`/`page`, because every page has to come back for parent-path
 * resolution. The SDK leaves `pagination` off this block's props entirely.
 */
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
  pagination,
}: ListingProps<"productListing">) => {
  if (!site) {
    return null;
  }

  return (
    <PaginatedListing
      pagination={pagination}
      records={records}
      label="Products"
    >
      <div className="grid gap-8 py-4 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((product) => (
          <ListProduct key={product.slug} product={product} site={site} />
        ))}
      </div>
    </PaginatedListing>
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
  pagination,
}: ListingProps<"profileListing">) => (
  <PaginatedListing pagination={pagination} records={records} label="Profiles">
    <ProfilesList profiles={records} className="py-4" />
  </PaginatedListing>
);
