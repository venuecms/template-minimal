import type { LocalizedContent } from "@venuecms/sdk-next";

/**
 * Whether a body would put anything on screen.
 *
 * `contentJSON` is truthy even for a cleared editor, which saves a doc holding
 * one empty paragraph, so a caller guarding on the field alone spaces around
 * nothing. Only a paragraph is judged by its children: an image or an embed
 * carries no text and is still content.
 */
export const hasRenderableContent = (content?: LocalizedContent): boolean => {
  if (content?.content?.trim()) {
    return true;
  }

  const nodes = content?.contentJSON?.content;

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
