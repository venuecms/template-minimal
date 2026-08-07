import {
  type ContentStyles,
  type NodeHandler,
  VenueContent as SdkVenueContent,
} from "@venuecms/sdk-next";
import { ComponentProps } from "react";

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
  | "a";

/**
 * One entry per node, in a single map: a string is the class name put on the
 * renderer the SDK already has, a component replaces that renderer.
 *
 * A component is how a node type the SDK has no renderer for — the listing
 * blocks an author places in content — gets rendered at all, rather than being
 * dropped with a console warning. Key it by TipTap node type (`heading`,
 * `eventListing`), not by the tag it renders as.
 */
export type ContentComponents = Readonly<
  Partial<Record<StyleOnlyNode, string>> & Record<string, string | NodeHandler>
>;

/**
 * The SDK takes the two kinds as separate props, so callers would otherwise
 * have to know which of their entries is which. Splitting here keeps that an
 * implementation detail of this wrapper.
 */
const splitContentComponents = (contentStyles: ContentComponents) => {
  const classes: ContentStyles = {};
  const components: Record<string, NodeHandler> = {};

  for (const [nodeType, entry] of Object.entries(contentStyles)) {
    if (typeof entry === "string") {
      classes[nodeType] = entry;
    } else if (entry) {
      // Anything else is a handler, but an explicit `undefined` entry would
      // reach the renderer as a component and throw on render.
      components[nodeType] = entry;
    }
  }

  return { classes, components };
};

type VenueContentProps = Omit<
  ComponentProps<typeof SdkVenueContent>,
  "contentStyles" | "components"
> & {
  contentStyles?: ContentComponents;
};

/**
 * The SDK renderer taking class names and components on one map, so a template
 * overrides how a node renders the same way it styles one.
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
