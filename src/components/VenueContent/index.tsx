import { VenueContent as SdkVenueContent } from "@venuecms/sdk-next";
import { ComponentProps } from "react";

import { listingBlockComponents } from "@/components/ListingBlock";

type VenueContentProps = Omit<
  ComponentProps<typeof SdkVenueContent>,
  "components"
>;

/**
 * The SDK renderer with this template's listing blocks wired in, so an
 * event/news/page/product/profile listing an author placed in content renders
 * as the matching list instead of being dropped.
 *
 * Import this rather than the SDK's VenueContent anywhere content the editor
 * produced is rendered. The one deliberate exception is content nested inside
 * a listing itself (a profile bio in a profile listing, say) — those keep the
 * plain SDK renderer, so a listing that matches its own container cannot
 * recurse forever.
 */
export const VenueContent = (props: VenueContentProps) => (
  <SdkVenueContent {...props} components={listingBlockComponents} />
);
