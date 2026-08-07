/**
 * The fetching half of a listing block: given the parameters parsed off the
 * node, each block builds its endpoint's query, resolves its own records, and
 * renders them with the template's list components.
 *
 * This is where the endpoint call lives now — @/lib/listingBlocks only hands
 * over the params — so this is where the query contract is pinned.
 */
import type { LocalizedContent } from "@venuecms/sdk-next";
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
const connection = vi.fn(() => Promise.resolve());

vi.mock("next/server", () => ({ connection: () => connection() }));

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
const { VenueContent } = await import("@/components/VenueContent");
const { contentComponents } = await import("./index");
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

const renderBlock = async (block: ReactNode, onError?: () => void) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      {block}
    </NextIntlClientProvider>,
    // A block whose endpoint rejects is expected in one test; React reports it
    // to onError, and the default handler would fail the run.
    onError ? { onError } : undefined,
  );
  await stream.allReady;
  return new Response(stream).text();
};

const contentWith = (...nodes: Array<Record<string, unknown>>) =>
  ({
    siteId: "site-id",
    locale: "en",
    contentJSON: { type: "doc", content: nodes },
  }) as LocalizedContent;

const paragraph = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});

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

  it.each([
    [
      "an event listing",
      () => <EventListingBlock {...parseEventListingAttributes({})} />,
    ],
    [
      "a news listing",
      () => <NewsListingBlock {...parseNewsListingAttributes({})} />,
    ],
    [
      "a page listing",
      () => <PageListingBlock {...parsePageListingAttributes({})} />,
    ],
    [
      "a product listing",
      () => <ProductListingBlock {...parseProductListingAttributes({})} />,
    ],
    [
      "a profile listing",
      () => <ProfileListingBlock {...parseProfileListingAttributes({})} />,
    ],
  ])("marks %s dynamic before it reads anything", async (_label, block) => {
    // A listing is request-time data, and next.config sets cacheComponents, so
    // a block that skips this is resolved during the prerender and frozen into
    // the shell. Nothing but this asserts it — the call is per-block now that
    // each block owns its own request.
    await renderBlock(block());

    expect(connection).toHaveBeenCalled();
  });

  it("keeps a failed endpoint contained in the block that called it", async () => {
    // The SDK usually reports a bad request in-band as empty data, but a
    // network failure still rejects. The block must be what throws, so the
    // boundaries @/lib/listingBlocks puts around it can catch it.
    getEvents.mockRejectedValue(new Error("endpoint is down"));

    await expect(
      renderBlock(<EventListingBlock {...parseEventListingAttributes({})} />),
    ).rejects.toThrow("endpoint is down");
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

/**
 * The whole feature, end to end: an author's block in real content, through the
 * real map and the real dispatch layer, to a rendered listing.
 *
 * The pieces are tested apart above; this is what pins them together — that
 * `contentComponents` wires each node type to the block that queries that node
 * type's endpoint, which nothing else asserts.
 */
describe("listing blocks in content", () => {
  it("resolves a block an author placed in content", async () => {
    getEvents.mockResolvedValue(listed("First gig"));

    const html = await renderBlock(
      <VenueContent
        content={contentWith({
          type: "eventListing",
          attrs: { limit: "3", tags: "jazz" },
        })}
        contentStyles={contentComponents}
      />,
    );

    expect(html).toContain("First gig");
    expect(getEvents).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 3, tags: ["jazz"] }),
    );
  });

  it("keeps the article when a listing's endpoint is down", async () => {
    getEvents.mockRejectedValue(new Error("endpoint is down"));

    const html = await renderBlock(
      <VenueContent
        content={contentWith(
          paragraph("Prose before"),
          { type: "eventListing" },
          paragraph("Prose after"),
        )}
        contentStyles={contentComponents}
      />,
      () => {},
    );

    expect(html).toContain("Prose before");
    expect(html).toContain("Prose after");
  });
});
