import { type LocalizedContent } from "@venuecms/sdk-next";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { VenueContent } from "./index";

/**
 * The one map a caller passes carries both kinds of entry: a string styles the
 * default renderer for that node type, a component replaces it. These pin that
 * both reach the SDK correctly, since it takes them as two separate props.
 */
const contentWith = (...nodes: Array<Record<string, unknown>>) =>
  ({
    siteId: "site-id",
    locale: "en",
    contentJSON: { type: "doc", content: nodes },
  }) as LocalizedContent;

const paragraph = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});

const heading = (text: string, level = 2) => ({
  type: "heading",
  attrs: { level },
  content: [{ type: "text", text }],
});

describe("VenueContent", () => {
  it("applies a string entry as a class name, as it did before", () => {
    const html = renderToStaticMarkup(
      <VenueContent
        content={contentWith(paragraph("Prose"))}
        contentStyles={{ p: "text-primary text-sm" }}
      />,
    );

    expect(html).toContain('class="text-primary text-sm"');
    expect(html).toContain("Prose");
  });

  it("renders a component entry instead of the default node renderer", () => {
    const html = renderToStaticMarkup(
      <VenueContent
        content={contentWith(heading("Section"))}
        contentStyles={{
          heading: ({ children }) => <div data-heading>{children}</div>,
        }}
      />,
    );

    expect(html).toContain("<div data-heading");
    expect(html).toContain("Section");
    // The default heading renderer is replaced, not wrapped.
    expect(html).not.toContain("<h2");
  });

  it("keeps string entries working alongside a component entry", () => {
    const html = renderToStaticMarkup(
      <VenueContent
        content={contentWith(heading("Section"), paragraph("Prose"))}
        contentStyles={{
          p: "text-sm",
          heading: ({ children }) => <div data-heading>{children}</div>,
        }}
      />,
    );

    expect(html).toContain("<div data-heading");
    expect(html).toContain('class="text-sm"');
  });

  it("routes a node type the SDK has no default for to its component", () => {
    // How a listing block reaches its renderer: an author-placed node type the
    // SDK would otherwise drop with a console warning.
    const html = renderToStaticMarkup(
      <VenueContent
        content={contentWith({ type: "eventListing", attrs: { limit: 3 } })}
        contentStyles={{
          eventListing: ({ node }) => (
            <p>{`limit:${String(node.attrs?.limit)}`}</p>
          ),
        }}
      />,
    );

    expect(html).toContain("limit:3");
  });

  it("renders content when given no map at all", () => {
    const html = renderToStaticMarkup(
      <VenueContent content={contentWith(paragraph("Prose"))} />,
    );

    expect(html).toContain("Prose");
  });
});
