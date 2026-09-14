import type { LocalizedContent } from "@venuecms/sdk-next";

/** Whether a body would put anything on screen. */
export const hasRenderableContent = (content?: LocalizedContent): boolean => {
  const doc = content?.contentJSON;

  // Mirrors VenueContent, which renders a present `contentJSON` and only falls
  // back to markdown without one — so an emptied doc beats a stale body.
  if (!doc) {
    return Boolean(content?.content?.trim());
  }

  const nodes = doc.content;

  // A cleared editor still saves a doc, holding one empty paragraph. Only a
  // paragraph is judged by its children; an image carries no text and is content.
  return (
    Array.isArray(nodes) &&
    nodes.some((node) => {
      const { type, content: children } = (node ?? {}) as {
        type?: string;
        content?: unknown;
      };

      return (
        type !== "paragraph" || (Array.isArray(children) && children.length > 0)
      );
    })
  );
};
