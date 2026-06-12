import removeMarkdown from "remove-markdown";

// rendered styles for rendered content
export const renderedStyles = {
  p: "text-primary text-sm",
  h2: "text-xl text-secondary",
  h3: "text-sm text-secondary",
  ol: "list-decimal pl-8",
  ul: "list-disc pl-4",
  a: "underline text-primary text-sm font-medium",
};

const htmlEntities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&mdash;": "—",
  "&ndash;": "–",
  "&hellip;": "…",
  "&lsquo;": "‘",
  "&rsquo;": "’",
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&copy;": "©",
  "&trade;": "™",
};

const decodeHtmlEntities = (text: string) =>
  text
    .replace(/&#(x?)([0-9a-f]+);/gi, (_, hex, code) =>
      String.fromCodePoint(parseInt(code, hex ? 16 : 10)),
    )
    .replace(/&\w+;/g, (entity) => htmlEntities[entity] || entity);

export const getExcerpt = (content?: string | null, maxLength = 300) => {
  if (!content) {
    return "";
  }

  const text = decodeHtmlEntities(
    removeMarkdown(content)
      .replace(/<[^>]*>/g, "")
      .replace(/\\/g, ""),
  )
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.lastIndexOf(" ", maxLength);
  return `${text.slice(0, truncated > 0 ? truncated : maxLength)}...`;
};