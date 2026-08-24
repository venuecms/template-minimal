import { setConfig } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductsListSection } from "./ProductsListSection";

vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("@/components/ListProduct", () => ({
  ListProduct: ({ product }: { product: { slug: string } }) => (
    <div data-testid="product">{product.slug}</div>
  ),
}));

// Containment alone would pass with the body drawn outside the listing, so the
// assertions read the section that should hold it.
const listingSection = (html: string) => html.split("<section")[1] ?? "";

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

let siteReadFails = false;

beforeEach(() => {
  setConfig({ siteKey: "test-site" });
  siteReadFails = false;

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);

    if (url.includes("/products")) {
      return new Response(
        JSON.stringify({
          records: Array.from({ length: PAGE_SIZE }, (_, i) => ({
            slug: `p${i}`,
            localizedContent: [],
          })),
          count: COUNT,
        }),
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
});

describe("the products listing body", () => {
  it("renders a body it was handed above the products", async () => {
    const section = listingSection(
      await render(
        <ProductsListSection currentPage={0} basePath="/p/merch">
          <p>Season notes</p>
        </ProductsListSection>,
      ),
    );

    expect(section.indexOf("Season notes")).toBeGreaterThan(-1);
    expect(section.indexOf("Season notes")).toBeLessThan(
      section.indexOf('data-testid="product"'),
    );
  });

  it("renders no body wrapper for the /shop route, which passes none", async () => {
    const html = await render(
      <ProductsListSection currentPage={0} basePath="/shop" />,
    );

    expect(html).not.toContain('class="pb-20"');
  });

  // The body costs no request of its own, so it sits outside the boundaries: a
  // failed grid read has no business taking an author's prose down with it.
  //
  // Asserted on what survives rather than on the error copy: the boundary that
  // catches the bailout is a client component, and React hands a suspended
  // boundary's error to the client rather than running its fallback in SSR.
  // That is also why this cannot see the boundary's *placement* — the body
  // renders in the server output either way — so the placement itself is
  // pinned in PageListing/boundaries.test.tsx, where the boundary is stubbed.
  it("keeps the body when the grid fails", async () => {
    siteReadFails = true;

    const html = await render(
      <ProductsListSection currentPage={0} basePath="/p/merch">
        <p>Season notes</p>
      </ProductsListSection>,
    );

    expect(html).toContain("Season notes");
  });
});

// The grid has no heading slot, so the record that would only have supplied a
// title is not worth a round trip on every render.
it("reads no page record for a title it has nowhere to draw", async () => {
  await render(<ProductsListSection currentPage={0} basePath="/shop" />);

  expect(requestedUrls().some((url) => url.includes("/pages"))).toBe(false);
});
