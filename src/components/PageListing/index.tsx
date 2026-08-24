/** The listing a page *is*, not `PageListingBlock`, which is a listing of pages. */
import {
  type LocalizedContent,
  MAX_PAGE,
  type SearchParams,
  VenueContent,
} from "@venuecms/sdk-next";

import { EventsListSection } from "@/components/EventsPage";
import { contentComponents } from "@/components/ListingBlock";
import { NewsView } from "@/components/News";
import { ProfilesListSection } from "@/components/ProfilesPage";
import { ProductsListSection } from "@/components/ShopPage";
import { hasRenderableContent } from "@/components/utils/pageContent";
import type { PageListingLayout } from "@/components/utils/pageLayout";

// Duplicates VEN-514's readPage (#69) on purpose; drop when that lands.
const readPage = (searchParams: SearchParams): number => {
  const raw = searchParams.page;
  const value = Array.isArray(raw) ? raw[0] : raw;

  // Digits only: Number() reads "1e3" as the deepest offset scan the endpoint allows.
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return 0;
  }

  return Math.min(Number(value), MAX_PAGE);
};

export const PageListing = ({
  layout,
  locale,
  title,
  content,
  basePath,
  searchParams,
}: {
  layout: PageListingLayout;
  locale: string;
  title?: string;
  /** The page's own body, rendered above the records. */
  content?: LocalizedContent;
  /** Path any pager builds hrefs against; only the route knows it. */
  basePath: string;
  searchParams: SearchParams;
}) => {
  // Emptiness decided here, not in the views, which would otherwise space
  // around a VenueContent that renders nothing.
  const body =
    content && hasRenderableContent(content) ? (
      <VenueContent
        className="flex max-w-[42rem] flex-col gap-6 text-sm"
        content={content}
        contentStyles={contentComponents}
        searchParams={searchParams}
      />
    ) : null;

  switch (layout) {
    // No body: this layout renders the latest article's, and two would compete.
    case "news":
      return <NewsView title={title} searchParams={searchParams} />;
    case "events":
      return (
        <EventsListSection locale={locale} title={title}>
          {body}
        </EventsListSection>
      );
    // No title: the shop grid has no heading slot.
    case "products":
      return (
        <ProductsListSection
          locale={locale}
          basePath={basePath}
          currentPage={readPage(searchParams)}
          searchParams={searchParams}
        >
          {body}
        </ProductsListSection>
      );
    // The events frame, which is also the archive's: with no /profiles route to
    // mirror, the index layout this template already uses is the one to match.
    case "profiles":
      return <ProfilesListSection title={title}>{body}</ProfilesListSection>;
  }

  // A layout added to the union without a case above is a compile error here
  // rather than a page that renders nothing: React accepts an undefined return,
  // so falling off this switch would be silent at runtime and at typecheck.
  layout satisfies never;

  return null;
};
