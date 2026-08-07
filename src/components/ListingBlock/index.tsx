/**
 * What this template renders content with: the prose class names, plus one
 * function per listing block an author can place in rich-text content.
 *
 * Each listing entry is handed records already fetched for it and lays them out
 * with the same list components the template uses for that record type
 * elsewhere, so a listing inside content looks like a listing anywhere else.
 * The querying behind them lives in @/lib/listingBlocks.
 *
 * An empty listing renders nothing. It sits mid-prose, where an empty-state
 * message would read as content the author wrote.
 *
 * Pass this to VenueContent's `contentStyles` anywhere editor content is
 * rendered. Content nested inside a listing passes plain `renderedStyles`
 * instead — without the listing entries, a listing cannot recurse into itself.
 */
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

export const contentComponents: ContentComponents = {
  ...renderedStyles,

  eventListing: ({ records, site }) =>
    records.length ? (
      <EventsList className="gap-y-12 py-4">
        {records.map((event) => (
          <ListEvent key={event.id} event={event} site={site} withImage />
        ))}
      </EventsList>
    ) : null,

  newsListing: ({ records, site }) =>
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
    ) : null,

  pageListing: ({ records, site }) =>
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
    ) : null,

  productListing: ({ records, site }) =>
    records.length ? (
      <div className="grid gap-8 py-4 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((product) => (
          <ListProduct key={product.slug} product={product} site={site} />
        ))}
      </div>
    ) : null,

  profileListing: ({ records }) =>
    records.length ? (
      <TwoSubColumnLayout className="py-4">
        {records.map((profile) => (
          <ProfileCompact key={profile.slug} profile={profile} />
        ))}
      </TwoSubColumnLayout>
    ) : null,
};
