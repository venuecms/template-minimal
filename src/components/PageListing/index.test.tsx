/**
 * What a page whose type names a listing draws.
 *
 * The type picks a frame; the records come from a block in the body. So what
 * matters here is that the body is rendered at all, that it reaches
 * `VenueContent` with the listing components and the page's own params, and
 * that it lands in the frame the matching route uses.
 *
 * Rendered to a string rather than a DOM: this template's tests have no jsdom,
 * and the frames are distinguishable from their markup.
 */
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { PageListing } from "./index";

vi.mock("../News", () => ({
  NewsView: () => <div data-testid="news-view" />,
}));

// Partial: the real `pageBodyStyles` is what this file asserts the body carries.
vi.mock("../ListingBlock", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../ListingBlock")>()),
  contentComponents: { p: "prose" },
}));

vi.mock("@venuecms/sdk-next", () => ({
  // Props are spelled into the markup because there is no DOM to read them off.
  VenueContent: ({
    className,
    contentStyles,
    searchParams,
  }: {
    className?: string;
    contentStyles: Record<string, unknown>;
    searchParams: Record<string, unknown>;
  }) => (
    <div data-testid="page-content">
      <span data-testid="body-class">{className}</span>
      <span data-testid="body-styles">
        {Object.keys(contentStyles).join("|")}
      </span>
      <span data-testid="body-params">
        {Object.entries(searchParams)
          .map(([key, value]) => `${key}=${value}`)
          .join("|")}
      </span>
    </div>
  ),
}));

const localizedContent = (content: string | null) => ({
  siteId: "s1",
  locale: "en",
  content,
});

const body = localizedContent("<p>Season notes</p>");

const render = async (node: React.ReactNode) => {
  const stream = await renderToReadableStream(<>{node}</>);
  await stream.allReady;

  return new Response(stream).text();
};

const renderListing = (props: Partial<Parameters<typeof PageListing>[0]>) =>
  render(<PageListing layout="events" searchParams={{}} {...props} />);

describe("PageListing", () => {
  it("renders the news listing through its own view", async () => {
    const html = await renderListing({ layout: "news", title: "Dispatches" });

    expect(html).toContain('data-testid="news-view"');
  });

  // That view draws the latest article's body; a second would compete with it.
  it("renders no body of its own for the news listing", async () => {
    const html = await renderListing({ layout: "news", content: body });

    expect(html).not.toContain('data-testid="page-content"');
  });

  it.each(["events", "profiles", "products"] as const)(
    "renders the page's own body for the %s listing",
    async (layout) => {
      const html = await renderListing({ layout, content: body });

      expect(html).toContain('data-testid="page-content"');
    },
  );

  // The shop sits in a section of its own; the other two head a two-column
  // layout with the page's title, the way /artists and /events do.
  it("frames the products listing the way /shop frames its own", async () => {
    const html = await renderListing({ layout: "products", content: body });

    expect(html).toContain('<section class="py-20">');
  });

  it.each(["events", "profiles"] as const)(
    "heads the %s listing with the page's title",
    async (layout) => {
      const html = await renderListing({
        layout,
        title: "Dispatches",
        content: body,
      });

      expect(html).toContain("Dispatches");
      expect(html).not.toContain("<section");
    },
  );

  it("leaves the products listing unheaded, as /shop is", async () => {
    const html = await renderListing({
      layout: "products",
      title: "Dispatches",
      content: body,
    });

    expect(html).not.toContain("Dispatches");
  });

  it("styles the body the way every page body is styled", async () => {
    const html = await renderListing({ layout: "events", content: body });

    expect(html).toContain(
      '<span data-testid="body-class">flex flex-col gap-6 text-sm</span>',
    );
  });

  it("gives the body the listing-block components", async () => {
    const html = await renderListing({ layout: "events", content: body });

    expect(html).toContain('<span data-testid="body-styles">p</span>');
  });

  // A block in the body pages off a param of its own; handing the body an empty
  // set would snap it back to its first page on every render.
  it("hands the body the page's own params", async () => {
    const html = await renderListing({
      layout: "events",
      content: body,
      searchParams: { page: "2", evt_9k3z1: "3" },
    });

    expect(html).toContain(
      '<span data-testid="body-params">page=2|evt_9k3z1=3</span>',
    );
  });

  // Nothing to draw means no frame either, or the page is a screenful of
  // padding above an empty column.
  it.each([
    ["no localized content", undefined],
    ["an empty body", localizedContent(null)],
  ])("renders nothing at all for %s", async (_label, content) => {
    const html = await renderListing({ layout: "events", content });

    expect(html).toBe("");
  });
});
