/**
 * What this template renders content with: the prose class names, plus one
 * component per listing block an author can place in rich-text content.
 *
 * Class names and listing components share one map because no node type takes
 * both — the SDK sorts them by value, applying a string as a class to a node it
 * already draws and calling a function with the records for that block.
 *
 * Pass this to VenueContent's `contentStyles` anywhere editor content is
 * rendered. Content nested inside a listing passes plain `renderedStyles`
 * instead — without the listing entries, a listing cannot recurse into itself.
 */
import type { AllListingComponents, ContentEntries } from "@venuecms/sdk-next";

import { renderedStyles } from "@/components/utils/styles";

import {
  EventListingBlock,
  NewsListingBlock,
  PageListingBlock,
  ProductListingBlock,
  ProfileListingBlock,
} from "./blocks";

/**
 * The class names for a page body rendered through `contentComponents`, shared
 * by every layout that draws one so they cannot drift apart.
 */
export const pageBodyStyles = "flex flex-col gap-6 text-sm";

// Annotated with AllListingComponents as well, so a listing type added to the
// contract fails to compile here until this template can render it — rather
// than being dropped from published content with a console warning.
export const contentComponents: ContentEntries & AllListingComponents = {
  ...renderedStyles,

  eventListing: EventListingBlock,
  newsListing: NewsListingBlock,
  pageListing: PageListingBlock,
  productListing: ProductListingBlock,
  profileListing: ProfileListingBlock,
};
