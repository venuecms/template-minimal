/**
 * The shop's product grid, now shared with the product listing block.
 *
 * The grid is the whole point of sharing: a block that drew products in a plain
 * even grid looked nothing like /shop, which leads with four products in a wide
 * track and runs the rest small. So the tracks are spelled out here rather than
 * asserted loosely — a drift in either one is what this file exists to catch.
 */
import type { Product, Site } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ListingRoot } from "@/components/ListingBlock/ListingRoot";
import { ProductListingBlock } from "@/components/ListingBlock/blocks";

import { ProductsList } from "./index";

const siteId = "site-id";

const site: Site = { id: siteId, timeZone: "Europe/Berlin", settings: {} };

const products = (count: number): Product[] =>
  Array.from({ length: count }, (_, i) => ({
    siteId,
    slug: `p${i}`,
    order: 0,
    featured: false,
    artists: [],
    localizedContent: [{ siteId, locale: "en", title: `Product ${i}` }],
  }));

// ListProduct reads the locale off the provider.
const render = async (node: ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      {node}
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return new Response(stream).text();
};

const REST_TRACK = "repeat(6,minmax(1rem,32rem))";

describe("ProductsList", () => {
  it("draws every product it was handed", async () => {
    const html = await render(
      <ProductsList products={products(6)} site={site} />,
    );

    expect(html).toContain("Product 0");
    expect(html).toContain("Product 5");
  });

  // The shop's signature: four leading products in a four-column track, the
  // rest in a six-column one.
  it("leads with four products in a wider track", async () => {
    const html = await render(
      <ProductsList products={products(6)} site={site} />,
    );

    expect(html).toContain("xl:grid-cols-4");
    expect(html).toContain(`xl:grid-cols-[${REST_TRACK}]`);
  });

  it("leads with the first four products, in order", async () => {
    const html = await render(
      <ProductsList products={products(6)} site={site} />,
    );
    const [lead, rest] = html.split(REST_TRACK);

    expect(lead).toContain("Product 3");
    expect(lead).not.toContain("Product 4");
    expect(rest).toContain("Product 4");
    // Positions, not just membership: a reversed lead holds the same four.
    expect(lead.indexOf("Product 0")).toBeLessThan(lead.indexOf("Product 3"));
    expect(rest.indexOf("Product 4")).toBeLessThan(rest.indexOf("Product 5"));
  });

  it("draws no second track when four or fewer products fit the first", async () => {
    const html = await render(
      <ProductsList products={products(4)} site={site} />,
    );

    expect(html).not.toContain("repeat(6");
  });

  // A gap between the tracks rather than padding under the first: a block that
  // fills one track would otherwise trail a screenful of nothing into the prose
  // under it.
  it("keeps the tracks apart without padding under a single track", async () => {
    const html = await render(
      <ProductsList products={products(6)} site={site} />,
    );

    expect(html).toContain('class="flex flex-col gap-20"');
    expect(html).not.toContain("pb-20");
  });

  it("takes the spacing its surroundings call for", async () => {
    const html = await render(
      <ProductsList products={products(1)} site={site} className="py-4" />,
    );

    expect(html).toContain('class="flex flex-col gap-20 py-4"');
  });

  /**
   * The reason the grid was extracted at all: a product listing block used to
   * draw its own plainer grid, so a products block on a page looked nothing
   * like the products on /shop.
   *
   * Compared as markup rather than by class name, because that is what catches
   * one of the two growing a wrapper the other has not. The block draws into
   * `ListingRoot` — the element carrying `data-listing`, which is what exempts
   * a listing from the page body's prose measure — so that is spelled out here
   * rather than dropped from the comparison.
   */
  it("is what the product listing block draws", async () => {
    const records = products(6);

    expect(
      await render(
        <ProductListingBlock records={records} site={site} pagination={null} />,
      ),
    ).toBe(
      await render(
        <ListingRoot>
          <ProductsList className="py-4" products={records} site={site} />
        </ListingRoot>,
      ),
    );
  });
});
