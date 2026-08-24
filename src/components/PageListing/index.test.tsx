import {
  type ContentEntries,
  MAX_PAGE,
  type SearchParams,
} from "@venuecms/sdk-next";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

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
  contentStyles,
  searchParams,
}: {
  contentStyles?: ContentEntries;
  searchParams?: SearchParams;
}) {
  return (
    <div
      data-testid="page-content"
      data-content-styles={
        typeof contentStyles?.p === "string" ? contentStyles.p : undefined
      }
      data-search-page={
        typeof searchParams?.page === "string" ? searchParams.page : undefined
      }
    />
  );
}

vi.mock("@/components/News", () => ({ NewsView: stub("news-view") }));
vi.mock("@/components/EventsPage", () => ({
  EventsListSection: stub("events-view"),
}));
vi.mock("@/components/ShopPage", () => ({
  ProductsListSection: stub("products-view"),
}));
vi.mock("@/components/ProfilesPage", () => ({
  ProfilesListSection: stub("profiles-view"),
}));
vi.mock("@/components/ListingBlock", () => ({
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
    ["products", "products-view"],
    ["profiles", "profiles-view"],
  ] as const)("renders the %s listing", async (layout, testId) => {
    expect(await renderListing({ layout })).toContain(
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

  it("gives the products listing no title, having nowhere to draw one", async () => {
    const html = await renderListing({ layout: "products", title: "Merch" });

    expect(html).toContain('data-testid="products-view"');
    expect(html).not.toContain("data-title");
  });

  it.each([
    ["products", "products-view"],
    ["profiles", "profiles-view"],
  ] as const)(
    "pages the %s listing against the page it is rendered on",
    async (layout, testId) => {
      const html = await renderListing({
        layout,
        basePath: "/p/merch",
        searchParams: { page: "2" },
      });

      expect(html).toContain(`data-testid="${testId}"`);
      expect(html).toContain('data-base-path="/p/merch"');
      expect(html).toContain('data-current-page="2"');
    },
  );

  it("takes the first of a repeated page param, as a route would", async () => {
    const html = await renderListing({
      layout: "products",
      searchParams: { page: ["1", "2"] },
    });

    expect(html).toContain('data-current-page="1"');
  });

  it("starts at the first page rather than fetching a nonsense one", async () => {
    for (const page of ["not-a-page", "-2", "3abc", "2.5", "1e3", ""]) {
      expect(
        await renderListing({ layout: "products", searchParams: { page } }),
      ).toContain('data-current-page="0"');
    }

    expect(
      await renderListing({ layout: "products", searchParams: {} }),
    ).toContain('data-current-page="0"');
  });

  it("clamps a hand-edited page rather than handing it to the endpoint", async () => {
    const html = await renderListing({
      layout: "products",
      searchParams: { page: String(MAX_PAGE + 5000) },
    });

    expect(html).toContain(`data-current-page="${MAX_PAGE}"`);
  });

  it.each([
    ["events", "events-view"],
    ["products", "products-view"],
    ["profiles", "profiles-view"],
  ] as const)(
    "renders the page's own content inside the %s listing",
    async (layout, testId) => {
      const html = await renderListing({
        layout,
        searchParams: { page: "2" },
        content: localizedContent({ content: "<p>Season notes</p>" }),
      });

      const view = withinView(html, testId);

      expect(view).toContain('data-testid="page-content"');
      // The content's own listing blocks need the styles and the page's params.
      expect(view).toContain('data-content-styles="prose"');
      expect(view).toContain('data-search-page="2"');
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

  // The body's own listing block pages by a param of its own.
  it("hands the products listing every param, not just the page", async () => {
    const html = await renderListing({
      layout: "products",
      searchParams: { page: "1", evt_9k3z1: "3" },
    });

    expect(html).toContain('data-block-param="3"');
  });
});
