import {
  type ContentEntries,
  MAX_PAGE,
  type SearchParams,
} from "@venuecms/sdk-next";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { pageBodyStyles } from "@/components/ListingBlock";

import { PageListing } from "./index";

// Declaration, not const: mock factories run before this module's consts init.
function stub(testId: string) {
  return ({
    children,
    ...props
  }: Record<string, unknown> & {
    children?: ReactNode;
    searchParams?: SearchParams;
  }) => {
    const blockParam = props.searchParams?.evt_9k3z1;

    return (
      <div
        data-testid={testId}
        data-title={typeof props.title === "string" ? props.title : undefined}
        data-base-path={
          typeof props.basePath === "string" ? props.basePath : undefined
        }
        data-current-page={
          typeof props.currentPage === "number"
            ? String(props.currentPage)
            : undefined
        }
        data-block-param={
          typeof blockParam === "string" ? blockParam : undefined
        }
      >
        {children}
      </div>
    );
  };
}

function contentStub({
  className,
  contentStyles,
  searchParams,
}: {
  className?: string;
  contentStyles?: ContentEntries;
  searchParams?: SearchParams;
}) {
  return (
    <div
      data-testid="page-content"
      // Compared here rather than round-tripped through an attribute: the class
      // string is full of characters React escapes, and a test that had to
      // un-escape them would be debugging entities instead of layout.
      data-measure-scoped={
        className?.includes(pageBodyStyles) ? "yes" : undefined
      }
      data-content-styles={
        typeof contentStyles?.p === "string" ? contentStyles.p : undefined
      }
      data-search-page={
        typeof searchParams?.page === "string" ? searchParams.page : undefined
      }
      data-block-param={
        typeof searchParams?.evt_9k3z1 === "string"
          ? searchParams.evt_9k3z1
          : undefined
      }
    />
  );
}

vi.mock("@/components/News", () => ({ NewsView: stub("news-view") }));
vi.mock("@/components/EventsPage", () => ({
  EventsListSection: stub("events-view"),
}));
// `ProductsListSection` is stubbed although the layout no longer renders it, so
// a layout that reaches for the shop's records again shows up as a failure here
// rather than as a second grid under the author's own products block.
vi.mock("@/components/ShopPage", () => ({
  ProductsLayout: stub("products-layout"),
  ProductsListSection: stub("products-records"),
}));
vi.mock("@/components/ProfilesPage", () => ({
  ProfilesListSection: stub("profiles-view"),
}));
// Partial, so the real `pageBodyStyles` is what the body is checked against.
vi.mock("@/components/ListingBlock", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/components/ListingBlock")>()),
  contentComponents: { p: "prose" },
}));
vi.mock("@venuecms/sdk-next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@venuecms/sdk-next")>()),
  VenueContent: contentStub,
}));

const localizedContent = (fields: {
  content?: string | null;
  contentJSON?: { [key: string]: unknown } | null;
}) => ({ siteId: "s1", locale: "en", ...fields });

const body = localizedContent({ content: "<p>Season notes</p>" });

// The stub views hold nothing but their children, so the markup up to the first
// close tag is what a view was handed.
const withinView = (html: string, testId: string) =>
  html.split(`data-testid="${testId}"`)[1]?.split("</div>")[0] ?? "";

const render = async (node: ReactNode) => {
  const stream = await renderToReadableStream(node);
  await stream.allReady;
  return new Response(stream).text();
};

const renderListing = (props: Partial<Parameters<typeof PageListing>[0]>) =>
  render(
    <PageListing
      layout="events"
      locale="en"
      basePath="/p/whats-on"
      searchParams={{}}
      {...props}
    />,
  );

describe("PageListing", () => {
  it.each([
    ["news", "news-view"],
    ["events", "events-view"],
    ["products", "products-layout"],
    ["profiles", "profiles-view"],
  ] as const)("renders the %s listing", async (layout, testId) => {
    expect(await renderListing({ layout, content: body })).toContain(
      `data-testid="${testId}"`,
    );
  });

  it.each([
    ["news", "news-view"],
    ["events", "events-view"],
    ["profiles", "profiles-view"],
  ] as const)(
    "gives the %s listing the page's own title",
    async (layout, testId) => {
      const html = await renderListing({ layout, title: "Dispatches" });

      expect(html).toContain(`data-testid="${testId}"`);
      expect(html).toContain('data-title="Dispatches"');
    },
  );

  it("gives the products layout no title, having nowhere to draw one", async () => {
    const html = await renderListing({
      layout: "products",
      title: "Merch",
      content: body,
    });

    expect(html).toContain('data-testid="products-layout"');
    expect(html).not.toContain('data-title="Merch"');
  });

  /**
   * The point of the whole split. A PRODUCTLIST page is an ordinary page whose
   * body holds a product listing block, so the layout is a frame and nothing
   * more — a listing fetched here would stack a second grid under the author's.
   */
  it("draws no products of its own, leaving them to the body's block", async () => {
    const html = await renderListing({ layout: "products", content: body });

    expect(html).not.toContain('data-testid="products-records"');
    expect(withinView(html, "products-layout")).toContain(
      'data-testid="page-content"',
    );
  });

  it("pages the profiles listing against the page it is rendered on", async () => {
    const html = await renderListing({
      layout: "profiles",
      basePath: "/p/roster",
      searchParams: { page: "2" },
    });

    expect(html).toContain('data-base-path="/p/roster"');
    expect(html).toContain('data-current-page="2"');
  });

  it("takes the first of a repeated page param, as a route would", async () => {
    const html = await renderListing({
      layout: "profiles",
      searchParams: { page: ["1", "2"] },
    });

    expect(html).toContain('data-current-page="1"');
  });

  it("starts at the first page rather than fetching a nonsense one", async () => {
    for (const page of ["not-a-page", "-2", "3abc", "2.5", ""]) {
      expect(
        await renderListing({ layout: "profiles", searchParams: { page } }),
      ).toContain('data-current-page="0"');
    }

    expect(
      await renderListing({ layout: "profiles", searchParams: {} }),
    ).toContain('data-current-page="0"');
  });

  // A listing block in this page's body reads the same query string with the
  // SDK's reader. If this route read "1e3" as page 0 while the block read it as
  // page 1000, one URL would mean two different pages on one screen.
  it("reads a page the SDK's own reader accepts", async () => {
    const html = await renderListing({
      layout: "profiles",
      searchParams: { page: "1e3" },
    });

    expect(html).toContain('data-current-page="1000"');
  });

  it("clamps a hand-edited page rather than handing it to the endpoint", async () => {
    const html = await renderListing({
      layout: "profiles",
      searchParams: { page: String(MAX_PAGE + 5000) },
    });

    expect(html).toContain(`data-current-page="${MAX_PAGE}"`);
  });

  it.each([
    ["events", "events-view"],
    ["products", "products-layout"],
    ["profiles", "profiles-view"],
  ] as const)(
    "renders the page's own content inside the %s listing",
    async (layout, testId) => {
      const html = await renderListing({
        layout,
        searchParams: { page: "2" },
        content: body,
      });

      const view = withinView(html, testId);

      expect(view).toContain('data-testid="page-content"');
      // The content's own listing blocks need the styles and the page's params.
      expect(view).toContain('data-content-styles="prose"');
      expect(view).toContain('data-search-page="2"');
    },
  );

  /**
   * The measure has to sit on the body's children rather than the body, or the
   * products block an author placed on a PRODUCTLIST page is capped at prose
   * width instead of filling the layout the way /shop's own grid does.
   *
   * That the selector actually reaches the block is a separate claim, pinned
   * against the real renderer in `ListingBlock/integration.test.tsx` — this one
   * only checks the body is styled with it at all.
   */
  it.each(["events", "products", "profiles"] as const)(
    "styles the %s body so a listing escapes the prose measure",
    async (layout) => {
      const html = await renderListing({ layout, content: body });

      expect(html).toContain('data-measure-scoped="yes"');
    },
  );

  // An empty block would leave the views spacing around nothing.
  it.each([
    ["no localized content", undefined],
    ["an empty body", localizedContent({ content: null })],
    ["a whitespace-only body", localizedContent({ content: "   " })],
    // What the editor saves for a body its author typed in and then cleared.
    [
      "an emptied editor doc",
      localizedContent({
        contentJSON: { type: "doc", content: [{ type: "paragraph" }] },
      }),
    ],
  ])("renders no content block for %s", async (_label, content) => {
    expect(await renderListing({ layout: "events", content })).not.toContain(
      'data-testid="page-content"',
    );
  });

  // The frame holds nothing but the body, so with no body it is a bare section
  // of padding on a page that used to draw a grid.
  it("draws no products frame at all for a body with nothing in it", async () => {
    const html = await renderListing({
      layout: "products",
      content: undefined,
    });

    expect(html).not.toContain('data-testid="products-layout"');
  });

  // The body's own listing block pages by a param of its own.
  it("hands the body every param, not just the page", async () => {
    const html = await renderListing({
      layout: "products",
      content: body,
      searchParams: { page: "1", evt_9k3z1: "3" },
    });

    expect(html).toContain('data-block-param="3"');
  });
});
