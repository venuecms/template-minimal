import {
  type ContentStyles,
  VenueContent as SdkVenueContent,
} from "@venuecms/sdk-next";
import { ComponentProps } from "react";

import type { ListingRenderers } from "@/lib/listingBlocks";
import { listingHandlers } from "@/lib/listingBlocks";

/**
 * The keys the renderer only ever reads a class name from.
 *
 * It dispatches a node by its TipTap type — `heading`, `paragraph`,
 * `bulletList` — and reads the class off the tag name that node renders as, so
 * the two are different vocabularies. A component under `h1` would never be
 * reached, because the node's type is `heading`; and moving `p` from a class
 * name to a component would drop its class without rendering the component.
 * Typing these class-only makes that a compile error rather than a node that
 * quietly renders unstyled.
 *
 * These are the keys the SDK actually applies, which is narrower than the
 * ElementClasses it declares: `text` is read into a discarded expression,
 * `heading` defers to h1/h2/h3, `hardBreak` renders a bare <br>, and the
 * youtube embed ignores `iframe`. Leaving those four out keeps a class that
 * would never land a compile error instead of a silent no-op.
 */
type StyleOnlyNode =
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "ul"
  | "ol"
  | "li"
  | "code"
  | "a"
  | "img"
  | "image"
  | "linkCard";

/**
 * One entry per node, in a single map: a string is the class name put on the
 * renderer the SDK already has, a function renders a listing block.
 *
 * A listing entry is a plain function of the block's parameters, already parsed
 * off the node and validated. It returns the component that resolves its own
 * records — nothing here calls an endpoint:
 *
 *   eventListing: (params) => <EventListingBlock {...params} />
 *
 * That component owns its request, so it is also what marks itself dynamic
 * (`await connection()`) before reading request-time data.
 *
 * Key it by TipTap node type (`p`, `eventListing`), not by the tag it renders
 * as. Only the listing types take a function: a node type the SDK already
 * renders is styled, not replaced.
 */
export type ContentComponents = Readonly<
  Partial<Record<StyleOnlyNode, string>> & ListingRenderers
>;

/**
 * The SDK takes class names and components as separate props, so callers would
 * otherwise have to know which of their entries is which — and wrap the listing
 * ones themselves. Doing both here keeps that an implementation detail of this
 * wrapper.
 */
const splitContentComponents = (contentStyles: ContentComponents) => {
  const classes: ContentStyles = {};

  for (const [nodeType, entry] of Object.entries(contentStyles)) {
    if (typeof entry === "string") {
      classes[nodeType] = entry;
    }
  }

  return { classes, components: listingHandlers(contentStyles) };
};

type VenueContentProps = Omit<
  ComponentProps<typeof SdkVenueContent>,
  "contentStyles" | "components"
> & {
  contentStyles?: ContentComponents;
};

/**
 * The SDK renderer taking class names and listing renderers on one map, so a
 * template says how a listing block draws the same way it styles a paragraph.
 *
 * Import this rather than the SDK's VenueContent anywhere content the editor
 * produced is rendered, and pass `contentComponents` from @/components/
 * ListingBlock to get this template's listings. One deliberate exception:
 * content nested inside a listing (a profile bio in a profile listing) passes
 * plain `renderedStyles`, since a map without the listing entries is what stops
 * a listing recursing into its own container.
 *
 * Nothing here imports a component: this stays a rendering-agnostic seam, and
 * what a listing looks like arrives on the map.
 */
export const VenueContent = ({
  contentStyles = {},
  ...props
}: VenueContentProps) => {
  const { classes, components } = splitContentComponents(contentStyles);

  return (
    <SdkVenueContent
      {...props}
      contentStyles={classes}
      components={components}
    />
  );
};
