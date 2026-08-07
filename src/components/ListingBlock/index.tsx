/**
 * How this template renders a listing an author placed in rich-text content.
 *
 * Each component here is presentational: it receives records already fetched by
 * @/lib/listingBlocks and lays them out with the same list components the
 * template uses for that record type elsewhere, so a listing inside content
 * looks like a listing anywhere else.
 *
 * An empty listing renders nothing. It sits mid-prose, where an empty-state
 * message would read as content the author wrote.
 */
import type {
  Event,
  Product,
  Profile,
  Page as VenuePage,
} from "@venuecms/sdk-next";

import type { ListingComponents, ListingProps } from "@/lib/listingBlocks";
import { createListingBlocks } from "@/lib/listingBlocks";

import { EventsList, ListEvent } from "@/components/EventList";
import { ListProduct } from "@/components/ListProduct";
import { ListPage, PagesList } from "@/components/PageList";
import { ProfileCompact } from "@/components/ProfileCompact";
import type { ContentComponents } from "@/components/VenueContent";
import { TwoSubColumnLayout } from "@/components/layout";
import {
  resolveNewsArticleHref,
  resolvePageHref,
} from "@/components/utils/pageHref";
import { renderedStyles } from "@/components/utils/styles";

const EventListing = ({ records, site }: ListingProps<Event>) =>
  records.length ? (
    <EventsList className="gap-y-12 py-4">
      {records.map((event) => (
        <ListEvent key={event.id} event={event} site={site} withImage />
      ))}
    </EventsList>
  ) : null;

const NewsListing = ({ records, site }: ListingProps<VenuePage>) =>
  records.length ? (
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
  ) : null;

const PageListing = ({ records, site }: ListingProps<VenuePage>) =>
  records.length ? (
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
  ) : null;

const ProductListing = ({ records, site }: ListingProps<Product>) =>
  records.length ? (
    <div className="grid gap-8 py-4 sm:grid-cols-2 lg:grid-cols-3">
      {records.map((product) => (
        <ListProduct key={product.slug} product={product} site={site} />
      ))}
    </div>
  ) : null;

const ProfileListing = ({ records }: ListingProps<Profile>) =>
  records.length ? (
    <TwoSubColumnLayout className="py-4">
      {records.map((profile) => (
        <ProfileCompact key={profile.slug} profile={profile} />
      ))}
    </TwoSubColumnLayout>
  ) : null;

export const listingComponents: ListingComponents = {
  eventListing: EventListing,
  newsListing: NewsListing,
  pageListing: PageListing,
  productListing: ProductListing,
  profileListing: ProfileListing,
};

/**
 * What this template renders content with: the prose class names, plus the
 * listing blocks as components on the same map.
 *
 * Pass this to VenueContent's `contentStyles` anywhere editor content is
 * rendered. Content nested inside a listing passes plain `renderedStyles`
 * instead — without the listing entries, a listing cannot recurse into itself.
 */
export const contentComponents: ContentComponents = {
  ...renderedStyles,
  ...createListingBlocks(listingComponents),
};
