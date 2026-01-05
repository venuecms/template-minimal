import removeMarkdown from "remove-markdown";

// rendered styles for rendered content
export const renderedStyles = {
  p: "text-primary",
  h2: "text-md text-secondary",
  h3: "text-md text-secondary",
  ol: "list-decimal pl-8",
  ul: "list-disc pl-4",
  a: "brightness-80 hover:brightness-150 text-primary font-medium",
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
