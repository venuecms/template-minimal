import { setConfig } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductsListSection } from "./ProductsListSection";

vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("@/components/ListProduct", () => ({
  ProductsList: ({ products }: { products: Array<{ slug: string }> }) => (
    <div data-testid="products">{products.map((p) => p.slug).join(",")}</div>
  ),
}));

const COUNT = 120;

const PAGE_SIZE = 50;

const render = async (node: ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      {node}
    </NextIntlClientProvider>,
    // The grid's boundary is expected to catch a failed read; without this the
    // recoverable error still reaches the console and reads as a test error.
    { onError: () => {} },
  );
  await stream.allReady;
  return new Response(stream).text();
};

const requestedUrls = () =>
  vi
    .mocked(globalThis.fetch)
    .mock.calls.map(([input]) =>
      input instanceof Request ? input.url : String(input),
    );

let productCount = COUNT;

beforeEach(() => {
  setConfig({ siteKey: "test-site" });
  productCount = COUNT;

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);

    if (url.includes("/products")) {
      return new Response(
        JSON.stringify({
          records: Array.from(
            { length: Math.min(productCount, PAGE_SIZE) },
            (_, i) => ({ slug: `p${i}`, localizedContent: [] }),
          ),
          count: productCount,
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        id: "site-id",
        timeZone: "Europe/Berlin",
        settings: {},
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the products listing", () => {
  // The grid is `ProductsList`, shared with the product listing block, so a
  // block and /shop draw the same thing rather than two grids that drift.
  it("draws its records through the shared products grid", async () => {
    const html = await render(
      <ProductsListSection currentPage={0} basePath="/shop" />,
    );

    expect(html).toContain('data-testid="products"');
    expect(html).toContain("p0,p1");
  });

  // The frame is `ProductsLayout`, which the route wraps around this.
  it("draws no frame of its own, leaving that to the layout", async () => {
    const html = await render(
      <ProductsListSection currentPage={0} basePath="/shop" />,
    );

    expect(html).not.toContain("<section");
  });
});

describe("the products listing pager", () => {
  it("pages against the /shop route when that is what rendered it", async () => {
    const html = await render(
      <ProductsListSection currentPage={0} basePath="/shop" />,
    );

    expect(html).toContain("/shop?page=1");
  });

  it("pages against the page it is rendered on, not /shop", async () => {
    const html = await render(
      <ProductsListSection currentPage={1} basePath="/p/merch" />,
    );

    expect(html).toContain("/p/merch?page=0");
    expect(html).toContain("/p/merch?page=2");
    expect(html).not.toContain("/shop?page=");
  });

  // Without this the body's listing block snaps back to its first page.
  it("keeps a listing block's own param when paging the route", async () => {
    const html = await render(
      <ProductsListSection
        currentPage={1}
        basePath="/p/merch"
        searchParams={{ page: "1", evt_9k3z1: "3" }}
      />,
    );

    expect(html).toContain("/p/merch?evt_9k3z1=3&amp;page=2");
  });

  it("draws no pager for a shop that fits on one page", async () => {
    productCount = 3;

    const html = await render(
      <ProductsListSection currentPage={0} basePath="/shop" />,
    );

    expect(html).not.toContain("?page=");
  });
});

// The grid has no heading slot, so the record that would only have supplied a
// title is not worth a round trip on every render.
it("reads no page record for a title it has nowhere to draw", async () => {
  await render(<ProductsListSection currentPage={0} basePath="/shop" />);

  expect(requestedUrls().some((url) => url.includes("/pages"))).toBe(false);
});
