import { MAX_PAGE } from "@venuecms/sdk-next";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { PageListing } from "./index";

// Declaration, not const: mock factories run before this module's consts init.
function stub(testId: string) {
  return (props: Record<string, unknown>) => (
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
  ] as const)("renders the %s listing", async (layout, testId) => {
    expect(await renderListing({ layout })).toContain(
      `data-testid="${testId}"`,
    );
  });

  it.each([
    ["news", "news-view"],
    ["events", "events-view"],
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

  it("pages the products listing against the page it is rendered on", async () => {
    const html = await renderListing({
      layout: "products",
      basePath: "/p/merch",
      searchParams: { page: "2" },
    });

    expect(html).toContain('data-base-path="/p/merch"');
    expect(html).toContain('data-current-page="2"');
  });

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
});
