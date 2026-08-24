import type { LocalizedContent } from "@venuecms/sdk-next";

/**
 * Whether a body would put anything on screen.
 *
 * `contentJSON` is truthy even for a cleared editor, which saves a doc holding
 * one empty paragraph, so a caller guarding on the field alone spaces around
 * nothing. Only a paragraph is judged by its children: an image or an embed
 * carries no text and is still content.
 *
 * The two fields are judged in the renderer's own order rather than the other
 * way round. `VenueContent` draws `contentJSON` whenever it is present and only
 * falls back to the `content` markdown when it is not, so a record still
 * carrying a stale markdown mirror under an emptied editor doc renders nothing.
 * Reading the markdown first would call that body renderable on the strength of
 * a field the renderer is never going to reach.
 */
export const hasRenderableContent = (content?: LocalizedContent): boolean => {
  if (!content?.contentJSON) {
    return Boolean(content?.content?.trim());
  }

  const nodes = content.contentJSON.content;

  if (!Array.isArray(nodes)) {
    return false;
  }

  return nodes.some((node) => {
    const { type, content: children } = (node ?? {}) as {
      type?: string;
      content?: unknown;
    };

    return (
      type !== "paragraph" || (Array.isArray(children) && children.length > 0)
    );
  });
};
