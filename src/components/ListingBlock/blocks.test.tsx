/**
 * The fetching half of a listing block: given the parameters parsed off the
 * node, each block builds its endpoint's query, resolves its own records, and
 * renders them with the template's list components.
 *
 * This is where the endpoint call lives now — @/lib/listingBlocks only hands
 * over the params — so this is where the query contract is pinned.
 */
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getEvents = vi.fn();
const getNews = vi.fn();
const getPages = vi.fn();
const getProducts = vi.fn();
const getProfiles = vi.fn();
const getSite = vi.fn();

vi.mock("next/server", () => ({ connection: () => Promise.resolve() }));

vi.mock("@venuecms/sdk-next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@venuecms/sdk-next")>()),
  getEvents,
  getNews,
  getPages,
  getProducts,
  getProfiles,
  getSite,
}));

const {
  EventListingBlock,
  NewsListingBlock,
  PageListingBlock,
  ProductListingBlock,
  ProfileListingBlock,
} = await import("./blocks");
const {
  parseEventListingAttributes,
  parseNewsListingAttributes,
  parsePageListingAttributes,
  parseProductListingAttributes,
  parseProfileListingAttributes,
} = await import("@/lib/listingBlocks/params");

const localizedContent = (title: string) => [
  { siteId: "site-id", locale: "en", title },
];

const listed = (...titles: string[]) => ({
  data: {
    records: titles.map((title) => ({
      id: title,
      slug: title,
      image: null,
      startDate: "2026-09-01T20:00:00.000Z",
      endDate: "2026-09-01T23:00:00.000Z",
      date: "2026-09-01T20:00:00.000Z",
      localizedContent: localizedContent(title),
    })),
  },
});

const renderBlock = async (block: ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      {block}
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return new Response(stream).text();
};

beforeEach(() => {
  vi.clearAllMocks();
  getSite.mockResolvedValue({ data: { timeZone: "Europe/Berlin" } });
  for (const endpoint of [
    getEvents,
    getNews,
    getPages,
    getProducts,
    getProfiles,
  ]) {
    endpoint.mockResolvedValue(listed());
  }
});

describe("listing blocks", () => {
  it("queries the events endpoint with the block's parameters", async () => {
    await renderBlock(
      <EventListingBlock
        {...parseEventListingAttributes({
          listingType: "past",
          limit: "3",
          tags: "jazz, live",
        })}
      />,
    );

    expect(getEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 3,
        tags: ["jazz", "live"],
        lt: expect.any(Number),
      }),
    );
    // "past" is a window, not a param — it must not reach the endpoint.
    expect(getEvents.mock.calls[0][0]).not.toHaveProperty("listingType");
  });

  it("renders the records it resolved", async () => {
    getEvents.mockResolvedValue(listed("First gig", "Second gig"));

    const html = await renderBlock(
      <EventListingBlock {...parseEventListingAttributes({})} />,
    );

    expect(html).toContain("First gig");
    expect(html).toContain("Second gig");
  });

  it("renders nothing for an empty listing", async () => {
    // A listing sits mid-prose, where an empty-state message would read as
    // content the author wrote.
    getEvents.mockResolvedValue(listed());

    await expect(
      renderBlock(<EventListingBlock {...parseEventListingAttributes({})} />),
    ).resolves.not.toContain("<div");
  });

  it("renders nothing rather than a siteless list when the site is unreadable", async () => {
    // The SDK reports a failed read as empty data, not a throw, so nothing
    // catches it — the gate is the only thing keeping `site` off a component
    // that has it typed non-null.
    getSite.mockResolvedValue({ data: undefined, error: new Error("no site") });
    getEvents.mockResolvedValue(listed("First gig"));

    await expect(
      renderBlock(<EventListingBlock {...parseEventListingAttributes({})} />),
    ).resolves.not.toContain("First gig");
  });

  it("routes a news listing to the news endpoint, linking to /news", async () => {
    getNews.mockResolvedValue(listed("An announcement"));

    const html = await renderBlock(
      <NewsListingBlock {...parseNewsListingAttributes({})} />,
    );

    expect(getNews).toHaveBeenCalledOnce();
    expect(html).toContain("An announcement");
    expect(html).toContain("/news/An announcement");
  });

  it("routes a page listing to the pages endpoint", async () => {
    getPages.mockResolvedValue(listed("A page"));

    const html = await renderBlock(
      <PageListingBlock {...parsePageListingAttributes({})} />,
    );

    expect(getPages).toHaveBeenCalledOnce();
    expect(html).toContain("A page");
  });

  it("routes a product listing to the products endpoint", async () => {
    getProducts.mockResolvedValue(listed("A record"));

    const html = await renderBlock(
      <ProductListingBlock {...parseProductListingAttributes({})} />,
    );

    expect(getProducts).toHaveBeenCalledOnce();
    expect(html).toContain("A record");
  });

  it("renders a profile listing without reading the site", async () => {
    // Profiles are the one listing that needs no site, so it does not fetch
    // one — a profile card still renders where the others cannot.
    getSite.mockResolvedValue({ data: undefined, error: new Error("no site") });
    getProfiles.mockResolvedValue(listed("An artist"));

    const html = await renderBlock(
      <ProfileListingBlock {...parseProfileListingAttributes({})} />,
    );

    expect(html).toContain("An artist");
    expect(getSite).not.toHaveBeenCalled();
  });
});
