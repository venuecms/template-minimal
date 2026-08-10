/**
 * A paginated route, driven for real.
 *
 * The tests under Pagination hand the component its numbers directly, which
 * proves the arithmetic but not that a route ever passes the right numbers in.
 * This runs the route's content component end to end — the real SDK client, the
 * real props, only the network stubbed — so the wiring between "what the
 * endpoint returned" and "what the pager links to" is covered.
 *
 * `/shop` is the one driven here because it is the more easily misread of the
 * two: it splits its records into a featured four and the rest, and the pager
 * has to count the whole page rather than the remainder.
 *
 * `connection()` is stubbed because the component calls it to opt out of the
 * prerender, and outside a Next request scope it throws.
 */
import { setConfig } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductsListContent } from "./ProductsListContent";

vi.mock("next/server", () => ({ connection: async () => {} }));

const ITEMS_PER_PAGE = 50;

const product = (n: number) => ({
  id: `p${n}`,
  siteId: "site-id",
  slug: `product-${n}`,
  publishState: "PUBLISHED",
  localizedContent: [
    { siteId: "site-id", locale: "en", title: `Product ${n}` },
  ],
});

/** What the products endpoint returns for a given page. */
let productsResponse: { records: unknown[]; count: number | null } = {
  records: [],
  count: 0,
};

const respondWith = (pageLength: number, count: number | null) => {
  productsResponse = {
    records: Array.from({ length: pageLength }, (_, i) => product(i)),
    count,
  };
};

beforeEach(() => {
  setConfig({ siteKey: "test-site" });

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);
    const body = url.includes("/products")
      ? productsResponse
      : { id: "site-id", timeZone: "Europe/Berlin", settings: {} };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const render = async (node: ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      {node}
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return new Response(stream).text();
};

const shopAt = (searchParams: Record<string, string | string[] | undefined>) =>
  render(
    <ProductsListContent
      locale="en"
      searchParams={Promise.resolve(searchParams)}
    />,
  );

describe("the shop route's pager", () => {
  it("asks the endpoint for the page the URL names", async () => {
    respondWith(ITEMS_PER_PAGE, 500);

    await shopAt({ page: "3" });

    const requested = vi
      .mocked(globalThis.fetch)
      .mock.calls.map(([input]) =>
        input instanceof Request ? input.url : String(input),
      );

    expect(requested.some((url) => url.includes("page=3"))).toBe(true);
  });

  it("links on to the next page while records remain", async () => {
    respondWith(ITEMS_PER_PAGE, 500);

    expect(await shopAt({})).toContain("/shop?page=1");
  });

  it("offers no next page from an exactly-full last page", async () => {
    // 100 records at 50 a page is pages 0 and 1, and page 1 is the last. This
    // is the off-by-one the two routes used to disagree about, driven through
    // the route rather than asserted against the component's props.
    respondWith(ITEMS_PER_PAGE, 100);

    const html = await shopAt({ page: "1" });

    expect(html).not.toContain("page=2");
    expect(html).toContain('href="/en/shop"');
  });

  it("counts the whole page, not the remainder after the featured four", async () => {
    // The layout shows the first four products separately. Paging off what is
    // left would misjudge the page by four records — here a full page would
    // look 46 long and a 4-record page would look empty.
    respondWith(4, null);

    // A 4-record page is short of the page size, so without a count there is no
    // evidence of another page — and so no pager. Counting the remainder would
    // read this page as empty instead.
    const html = await shopAt({});

    expect(html).toContain("Product 3");
    expect(html).not.toContain("page=");
  });

  it("renders no pager when the whole shop fits on one page", async () => {
    respondWith(12, 12);

    expect(await shopAt({})).not.toContain("page=");
  });

  it("carries the route's other query params through the pager", async () => {
    respondWith(ITEMS_PER_PAGE, 500);

    const html = await shopAt({ page: "1", tag: "vinyl" });

    expect(html).toContain("tag=vinyl&amp;page=2");
  });
});
