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
// `count` is optional on this response, so the pager's countless path needs a
// mock that can leave it off rather than send a zero.
let sendCount = true;
let siteReadFails = false;

beforeEach(() => {
  setConfig({ siteKey: "test-site" });
  productCount = COUNT;
  sendCount = true;
  siteReadFails = false;

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);

    if (url.includes("/products")) {
      const records = Array.from(
        { length: Math.min(productCount, PAGE_SIZE) },
        (_, i) => ({ slug: `p${i}`, localizedContent: [] }),
      );

      return new Response(
        JSON.stringify(
          sendCount ? { records, count: productCount } : { records },
        ),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    if (siteReadFails) {
      return new Response("upstream is down", { status: 500 });
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

  it("steps both ways from the middle of the listing", async () => {
    const html = await render(
      <ProductsListSection currentPage={1} basePath="/shop" />,
    );

    expect(html).toContain("/shop?page=0");
    expect(html).toContain("/shop?page=2");
  });

  // Without this a listing block elsewhere on the page snaps back to page one.
  it("keeps every other param when paging the route", async () => {
    const html = await render(
      <ProductsListSection
        currentPage={1}
        basePath="/shop"
        searchParams={{ page: "1", evt_9k3z1: "3" }}
      />,
    );

    expect(html).toContain("/shop?evt_9k3z1=3&amp;page=2");
  });

  it("draws no pager for a shop that fits on one page", async () => {
    productCount = 3;

    const html = await render(
      <ProductsListSection currentPage={0} basePath="/shop" />,
    );

    expect(html).not.toContain("?page=");
  });

  // A count of zero is an empty shop, not a missing count. Reading it as the
  // latter offered ninety-nine pages of "No products found".
  it("draws no pager for an empty shop", async () => {
    productCount = 0;

    const html = await render(
      <ProductsListSection currentPage={0} basePath="/shop" />,
    );

    expect(html).toContain("No products found");
    expect(html).not.toContain("?page=");
  });

  /**
   * `count` is optional on this response. Without one the pager can only follow
   * the records: a full page might have another behind it, a short one is the
   * last — and an empty page past the end still owes the reader a way back.
   */
  describe("when the endpoint sends no count", () => {
    beforeEach(() => {
      sendCount = false;
    });

    it("offers a next page while full pages keep coming back", async () => {
      const html = await render(
        <ProductsListSection currentPage={0} basePath="/shop" />,
      );

      expect(html).toContain("/shop?page=1");
    });

    it("offers no next page once a short page arrives", async () => {
      productCount = 3;

      const html = await render(
        <ProductsListSection currentPage={0} basePath="/shop" />,
      );

      expect(html).not.toContain("?page=");
    });

    it("keeps a way back off a page past the end", async () => {
      productCount = 0;

      const html = await render(
        <ProductsListSection currentPage={4} basePath="/shop" />,
      );

      expect(html).toContain("/shop?page=3");
      expect(html).not.toContain("/shop?page=5");
    });
  });
});

// `getSite()` reporting a failed read as absent data is the one thing standing
// between a siteless product and `ListProduct`, which types it non-null.
it("bails out rather than drawing products without a site", async () => {
  siteReadFails = true;

  const html = await render(
    <ProductsListSection currentPage={0} basePath="/shop" />,
  );

  expect(html).not.toContain('data-testid="products"');
});

// The grid has no heading slot, so the record that would only have supplied a
// title is not worth a round trip on every render.
it("reads no page record for a title it has nowhere to draw", async () => {
  await render(<ProductsListSection currentPage={0} basePath="/shop" />);

  expect(requestedUrls().some((url) => url.includes("/pages"))).toBe(false);
});
