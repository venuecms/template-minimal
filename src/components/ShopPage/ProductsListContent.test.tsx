import { setConfig } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductsListContent } from "./ProductsListContent";
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
  );
  await stream.allReady;
  return new Response(stream).text();
};

beforeEach(() => {
  setConfig({ siteKey: "test-site" });

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);

    let body: unknown = {
      id: "site-id",
      timeZone: "Europe/Berlin",
      settings: {},
    };

    if (url.includes("/products")) {
      body = {
        records: Array.from({ length: PAGE_SIZE }, (_, i) => ({
          slug: `p${i}`,
          localizedContent: [],
        })),
        count: COUNT,
      };
    } else if (url.includes("/pages")) {
      body = {
        id: "page-id",
        slug: "shop",
        localizedContent: [{ siteId: "site-id", locale: "en", title: "Shop" }],
      };
    }

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the products listing pager", () => {
  it("pages against the /shop route when that is what rendered it", async () => {
    const html = await render(
      <ProductsListContent locale="en" currentPage={0} basePath="/shop" />,
    );

    expect(html).toContain("/shop?page=1");
  });

  it("pages against the page it is rendered on, not /shop", async () => {
    const html = await render(
      <ProductsListContent locale="en" currentPage={1} basePath="/p/merch" />,
    );

    expect(html).toContain("/p/merch?page=0");
    expect(html).toContain("/p/merch?page=2");
    expect(html).not.toContain("/shop?page=");
  });

  // Without this the body's listing block snaps back to its first page.
  it("keeps a listing block's own param when paging the route", async () => {
    const html = await render(
      <ProductsListContent
        locale="en"
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
        <ProductsListContent locale="en" currentPage={0} basePath="/p/merch">
          <p>Season notes</p>
        </ProductsListContent>,
      ),
    );

    expect(section.indexOf("Season notes")).toBeGreaterThan(-1);
    expect(section.indexOf("Season notes")).toBeLessThan(
      section.indexOf('data-testid="product"'),
    );
  });

  it("renders no body wrapper for the /shop route, which passes none", async () => {
    const html = await render(
      <ProductsListContent locale="en" currentPage={0} basePath="/shop" />,
    );

    expect(html).not.toContain('class="pb-20"');
  });
});

describe("the products listing section", () => {
  it("hands the body it was given to the content it wraps", async () => {
    const section = listingSection(
      await render(
        <ProductsListSection locale="en" currentPage={0} basePath="/p/merch">
          <p>Season notes</p>
        </ProductsListSection>,
      ),
    );

    expect(section).toContain("Season notes");
  });
});
