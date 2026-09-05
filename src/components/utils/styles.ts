import type { ContentStyles } from "@venuecms/sdk-next";
import removeMarkdown from "remove-markdown";

/**
 * Class names for rendered content, one per node the SDK's renderer styles.
 *
 * Annotated so a key the renderer never reads is a compile error rather than a
 * class that silently lands nowhere. `ContentStyles` is deliberately narrower
 * than the classes the SDK declares — it leaves out `text`, `heading`,
 * `hardBreak` and `iframe`, which its renderer accepts but never applies
 * (`heading` defers to h1/h2/h3, embeds ignore `iframe`) — so styling a heading
 * means naming h1/h2/h3, and this is what says so.
 *
 * The annotation has to live here, not at the call sites: it reaches the
 * renderer both spread into a larger map and passed as a bare variable, and
 * excess-property checking is exempt in both.
 */
export const renderedStyles: ContentStyles = {
  p: "text-primary text-sm max-w-[72ch]",
  h2: "text-xl text-secondary",
  h3: "text-sm text-secondary",
  ol: "list-decimal pl-8",
  ul: "list-disc pl-4",
  a: "underline text-primary text-sm font-medium",
};

export const getExcerpt = (content?: string | null) => {
  if (!content) {
    return "";
  }

  const text = removeMarkdown(content);

  if (text.length > 300) {
    return `${text.slice(0, 300)}...`;
  }

  return text;
};
