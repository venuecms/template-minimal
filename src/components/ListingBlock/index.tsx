/**
 * What this template renders content with: the prose class names, plus one
 * entry per listing block an author can place in rich-text content.
 *
 * Each listing entry is handed the block's parameters and returns the component
 * that resolves its own records — the endpoint call lives in ./blocks, not in
 * the content renderer. @/lib/listingBlocks is what parses those parameters off
 * the node and suspends what comes back.
 *
 * Pass this to VenueContent's `contentStyles` anywhere editor content is
 * rendered. Content nested inside a listing passes plain `renderedStyles`
 * instead — without the listing entries, a listing cannot recurse into itself.
 */
import type { AllListingRenderers } from "@/lib/listingBlocks";

import type { ContentComponents } from "@/components/VenueContent";
import { renderedStyles } from "@/components/utils/styles";

import {
  EventListingBlock,
  NewsListingBlock,
  PageListingBlock,
  ProductListingBlock,
  ProfileListingBlock,
} from "./blocks";

// Annotated with AllListingRenderers as well, so a listing type added to the
// contract fails to compile here until this template can render it — rather
// than being dropped from published content with a console warning.
export const contentComponents: ContentComponents & AllListingRenderers = {
  ...renderedStyles,

  eventListing: (params) => <EventListingBlock {...params} />,
  newsListing: (params) => <NewsListingBlock {...params} />,
  pageListing: (params) => <PageListingBlock {...params} />,
  productListing: (params) => <ProductListingBlock {...params} />,
  profileListing: (params) => <ProfileListingBlock {...params} />,
};
