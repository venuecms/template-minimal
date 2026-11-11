/**
 * The `emailListSignup` node an author can place in rich-text content.
 *
 * The SDK's renderer has no handler for this node and silently drops it, so the
 * template supplies one through VenueContent's `components` prop (see
 * `contentHandlers` in ListingBlock). The node carries only the tag ids a
 * signup is filed under; the wording is the template's, from the dictionaries.
 */
import type { NodeProps } from "@venuecms/sdk-next";

import { EmailSignupForm } from "./EmailSignupForm";

const tagsFrom = (node: NodeProps["node"]): string[] => {
  const tags = node.attrs?.tags;
  return Array.isArray(tags)
    ? tags.filter((tag): tag is string => typeof tag === "string" && !!tag)
    : [];
};

export const EmailListSignupBlock = ({ node }: NodeProps) => (
  <EmailSignupForm tags={tagsFrom(node)} />
);

export { EmailSignupForm } from "./EmailSignupForm";
