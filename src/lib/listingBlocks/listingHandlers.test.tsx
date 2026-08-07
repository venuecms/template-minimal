/**
 * The seam this module exists for: the query layer takes its renderers as an
 * argument, the way the renderer takes `contentStyles`. These tests only ever
 * inject stub renderers, which is the point — nothing here may depend on what a
 * listing looks like, because this layer is destined for @venuecms/sdk-next
 * while the components stay in the template.
 */
import type { LocalizedContent } from "@venuecms/sdk-next";
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

const { VenueContent } = await import("@venuecms/sdk-next");
const { listingHandlers } = await import("./index");
type AllListingRenderers = import("./index").AllListingRenderers;
const { LISTING_BLOCK_NODE_TYPES } = await import("./params");

const records = (...titles: string[]) => ({
  data: { records: titles.map((title) => ({ id: title, slug: title })) },
});

const contentWith = (
  ...nodes: Array<Record<string, unknown>>
): LocalizedContent => ({
  siteId: "site-id",
  locale: "en",
  contentJSON: { type: "doc", content: nodes },
});

const paragraph = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});

const label = (type: string, ids: Array<string | undefined>) => (
  <p>{`${type}[${ids.join(",")}]`}</p>
);

/**
 * Names each injected renderer so a test can tell which one was reached.
 *
 * Spelled out per type rather than generated, so `records` keeps the concrete
 * record type the contract promises for that listing. Typed as the all-required
 * map so a listing type added to the contract fails to compile here, which is
 * what makes "covers every listing node type" able to catch an unregistered one.
 */
const stubRenderers = (): AllListingRenderers => ({
  eventListing: ({ records }) =>
    label(
      "eventListing",
      records.map((record) => record.id),
    ),
  newsListing: ({ records }) =>
    label(
      "newsListing",
      records.map((record) => record.id),
    ),
  pageListing: ({ records }) =>
    label(
      "pageListing",
      records.map((record) => record.id),
    ),
  productListing: ({ records }) =>
    label(
      "productListing",
      records.map((record) => record.slug),
    ),
  profileListing: ({ records }) =>
    label(
      "profileListing",
      records.map((record) => record.slug),
    ),
});

const renderContent = async (content: LocalizedContent) => {
  const stream = await renderToReadableStream(
    <VenueContent content={content} components={listingHandlers(stubRenderers())} />,
    // A listing that throws is expected in one test; React reports it to
    // onError, and the default handler would fail the run.
    { onError: () => {} },
  );
  await stream.allReady;
  return new Response(stream).text();
};

const render = (node: Record<string, unknown>) =>
  renderContent(contentWith(node));

beforeEach(() => {
  vi.clearAllMocks();
  getSite.mockResolvedValue({ data: { timeZone: "Europe/Berlin" } });
  for (const fetcher of [
    getEvents,
    getNews,
    getPages,
    getProducts,
    getProfiles,
  ]) {
    fetcher.mockResolvedValue(records());
  }
});

describe("listingHandlers", () => {
  it("hands the fetched records to the injected renderer", async () => {
    getEvents.mockResolvedValue(records("first", "second"));

    await expect(render({ type: "eventListing" })).resolves.toContain(
      "eventListing[first,second]",
    );
  });

  it("queries the endpoint with the params parsed off the node", async () => {
    await render({
      type: "eventListing",
      attrs: { listingType: "past", limit: "3", tags: "jazz, live" },
    });

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

  it.each([
    ["eventListing", getEvents],
    ["newsListing", getNews],
    ["pageListing", getPages],
    ["productListing", getProducts],
    ["profileListing", getProfiles],
  ])("routes %s to its own endpoint and renderer", async (type, fetcher) => {
    fetcher.mockResolvedValue(records("record"));

    await expect(render({ type })).resolves.toContain(`${type}[record]`);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("covers every listing node type in the contract", () => {
    expect(Object.keys(listingHandlers(stubRenderers())).sort()).toEqual(
      [...LISTING_BLOCK_NODE_TYPES].sort(),
    );
  });

  it("registers no handler for a listing a caller left off the map", () => {
    // Renderers are optional, so a template can opt out of a listing type. It
    // has to stay unregistered rather than register a handler that renders
    // nothing, or the SDK could not fall back to its own renderer.
    expect(
      Object.keys(listingHandlers({ eventListing: () => null })),
    ).toEqual(["eventListing"]);
  });

  it("keeps the surrounding content when a listing fails", async () => {
    getEvents.mockRejectedValue(new Error("endpoint is down"));

    const html = await renderContent(
      contentWith(
        paragraph("Prose before"),
        { type: "eventListing" },
        paragraph("Prose after"),
      ),
    );

    expect(html).not.toContain("eventListing[");
    expect(html).toContain("Prose before");
    expect(html).toContain("Prose after");
  });

  it("renders nothing rather than a siteless list when the site is unreadable", async () => {
    // The SDK reports a failed read as empty data, not a throw, so nothing
    // here catches it — the gate is the only thing keeping `site` off a
    // renderer that has it typed non-null.
    getSite.mockResolvedValue({ data: undefined, error: new Error("no site") });
    getEvents.mockResolvedValue(records("first"));

    await expect(render({ type: "eventListing" })).resolves.not.toContain(
      "eventListing[",
    );
  });

  it("lets the injected renderer decide how an empty listing renders", async () => {
    getEvents.mockResolvedValue(records());

    await expect(render({ type: "eventListing" })).resolves.toContain(
      "eventListing[]",
    );
  });
});
