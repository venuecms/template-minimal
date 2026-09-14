import type { LocalizedContent, SearchParams } from "@venuecms/sdk-next";
import { VenueContent } from "@venuecms/sdk-next";

import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

import { contentComponents, pageBodyStyles } from "../ListingBlock";
import { NewsView } from "../News";
import { hasRenderableContent } from "../utils/pageContent";
import type { PageListingLayout } from "../utils/pageLayout";

/**
 * A page whose type names a listing.
 *
 * The type picks the frame and nothing else: the records come from a listing
 * block the author placed in the body, which is where the limit, the ordering
 * and whether it pages at all are already decided. That is why this draws no
 * records of its own — a layout that fetched as well would put a second,
 * unasked-for listing on the page.
 */
export const PageListing = ({
  layout,
  title,
  content,
  searchParams,
}: {
  layout: PageListingLayout;
  /** Heads the listing the way its own route does; the shop route has none. */
  title?: string;
  /** The page's own body, which holds the block drawing the records. */
  content?: LocalizedContent;
  /** The body's listing blocks page themselves off these. */
  searchParams: SearchParams;
}) => {
  // This view draws the latest article's body; a second would compete with it.
  if (layout === "news") {
    return <NewsView title={title} searchParams={searchParams} />;
  }

  // Nothing to draw means no frame either, or the page is a screenful of
  // padding above an empty column.
  if (!content || !hasRenderableContent(content)) {
    return null;
  }

  const body = (
    <VenueContent
      className={pageBodyStyles}
      content={content}
      contentStyles={contentComponents}
      searchParams={searchParams}
    />
  );

  // The frames the /shop, /events and /artists routes use, so a page typed as
  // one of those listings sits where its own index does.
  switch (layout) {
    case "products":
      return <section className="py-20">{body}</section>;
    case "events":
    case "profiles":
      return (
        <TwoColumnLayout>
          <ColumnLeft className="text-sm text-secondary">
            {title ? <p className="pb-8 text-primary">{title}</p> : null}
          </ColumnLeft>
          <ColumnRight>{body}</ColumnRight>
        </TwoColumnLayout>
      );
  }
};
