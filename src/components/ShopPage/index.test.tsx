/**
 * The product listing mounted somewhere other than /shop.
 *
 * A page whose type is PRODUCTLIST renders this same listing from `/p/<slug>`,
 * so the two things the layout used to hardcode — which page record it titles
 * itself from, and which URL its pager counts against — now come from props. A
 * regression in either is invisible on /shop, where the hardcoded values happen
 * to be right, and only shows up on the page type this test stands in for.
 *
 * `connection()` is stubbed because the listing calls it to opt out of the
 * prerender, and outside a Next request scope it throws. `getTranslations` is
 * stubbed for the same reason: with no Next request scope, `next-intl/server`
 * resolves to its client build, which throws on sight.
 */
import { setConfig } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import messages from "@/lib/i18n/dictionaries/en.json";

import { ProductsListContent } from "./ProductsListContent";

vi.mock("next/server", () => ({ connection: async () => {} }));

vi.mock("next-intl/server", async () => {
  const dictionary = (await import("@/lib/i18n/dictionaries/en.json")).default;

  return {
    getTranslations:
      async (namespace: keyof typeof dictionary) => (key: string) =>
        (dictionary[namespace] as Record<string, string>)?.[key] ?? key,
  };
});

/** Past one page of the listing's 50, so the pager has somewhere to go. */
const COUNT = 120;

const product = (slug: string) => ({
  id: slug,
  siteId: "site-id",
  slug,
  localizedContent: [{ siteId: "site-id", locale: "en", title: slug }],
});

/** More than the four featured ones, so the pager renders at all. */
const products = Array.from({ length: 6 }, (_, i) => product(`p${i}`));

let requested: Array<string> = [];

beforeEach(() => {
  requested = [];
  setConfig({ siteKey: "test-site" });

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);
    requested.push(url);

    const body = url.includes("/products")
      ? { records: products, count: COUNT }
      : url.includes("/pages/")
        ? {
            id: "page-id",
            slug: "merch",
            type: "PRODUCTLIST",
            localizedContent: [
              { siteId: "site-id", locale: "en", title: "Merch" },
            ],
          }
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

const render = async (node: React.ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  );
  await stream.allReady;

  return new Response(stream).text();
};

const listing = (overrides?: { currentPage?: number }) => (
  <ProductsListContent
    locale="en"
    currentPage={overrides?.currentPage ?? 1}
    slug="merch"
    baseUrl="/p/merch"
  />
);

// Hrefs carry the locale because these render through the i18n `Link`.
describe("the product listing away from /shop", () => {
  it("pages against the URL it was mounted at, not /shop", async () => {
    const html = await render(listing());

    expect(html).toContain('href="/en/p/merch?page=0"');
    expect(html).toContain('href="/en/p/merch?page=2"');
    expect(html).not.toContain("/shop?page=");
  });

  it("titles itself from the page it was given, not the shop page", async () => {
    await render(listing());

    expect(requested.some((url) => url.includes("/pages/merch"))).toBe(true);
    expect(requested.some((url) => url.includes("/pages/shop"))).toBe(false);
  });

  it("still sends a product's link to its detail route under /shop", async () => {
    // The listing moves; the products themselves do not. `/shop/<slug>` is the
    // only route that renders one, so a relocated listing must not rewrite
    // these to sit under its own path.
    const html = await render(listing());

    expect(html).toContain('href="/en/shop/p0"');
  });
});
