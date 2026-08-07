/**
 * The seam this module exists for: it hands a listing entry the block's
 * parameters and nothing else.
 *
 * Resolving records is the entry's job. This layer never calls an endpoint —
 * that is what keeps rendering content from being the thing that queries, and
 * what lets the whole module move into @venuecms/sdk-next while the fetching
 * and the components stay in the template. These tests only ever inject stub
 * entries, which is the point: nothing here may depend on what a listing looks
 * like or where its records come from.
 */
import type { LocalizedContent } from "@venuecms/sdk-next";
import { renderToReadableStream, renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getEvents = vi.fn();
const getNews = vi.fn();
const getPages = vi.fn();
const getProducts = vi.fn();
const getProfiles = vi.fn();
const getSite = vi.fn();

const endpoints = {
  getEvents,
  getNews,
  getPages,
  getProducts,
  getProfiles,
  getSite,
};

vi.mock("@venuecms/sdk-next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@venuecms/sdk-next")>()),
  ...endpoints,
}));

const { VenueContent } = await import("@venuecms/sdk-next");
const { listingHandlers } = await import("./index");
type AllListingRenderers = import("./index").AllListingRenderers;
type ListingParams = import("./index").ListingParams;
type ListingBlockNodeType = import("./params").ListingBlockNodeType;
const { LISTING_BLOCK_NODE_TYPES } = await import("./params");

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

/**
 * What each entry was last handed, keyed by listing type — so a test reads the
 * params back at the exact type that listing promises, and reading a param off
 * the wrong listing is a compile error rather than an assertion on `undefined`.
 */
const calls: { [Type in ListingBlockNodeType]?: ListingParams[Type] } = {};

const marker = (nodeType: ListingBlockNodeType) => (
  <p>{`${nodeType} rendered`}</p>
);

/**
 * Spelled out per type rather than generated, and typed as the all-required
 * map, so a listing type added to the contract fails to compile here — which is
 * what makes "covers every listing node type" able to catch an unregistered one.
 * Writing each assignment out is also what keeps `calls` correlated: a generic
 * recorder would widen every entry's params to the union.
 */
const stubRenderers = (): AllListingRenderers => ({
  eventListing: (params) => {
    calls.eventListing = params;
    return marker("eventListing");
  },
  newsListing: (params) => {
    calls.newsListing = params;
    return marker("newsListing");
  },
  pageListing: (params) => {
    calls.pageListing = params;
    return marker("pageListing");
  },
  productListing: (params) => {
    calls.productListing = params;
    return marker("productListing");
  },
  profileListing: (params) => {
    calls.profileListing = params;
    return marker("profileListing");
  },
});

const renderContent = async (
  content: LocalizedContent,
  renderers: AllListingRenderers = stubRenderers(),
) => {
  const stream = await renderToReadableStream(
    <VenueContent content={content} components={listingHandlers(renderers)} />,
    // An entry that throws is expected in one test; React reports it to
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
  for (const nodeType of LISTING_BLOCK_NODE_TYPES) {
    delete calls[nodeType];
  }
});

describe("listingHandlers", () => {
  it("calls no endpoint of its own", async () => {
    // The guarantee the whole shape rests on: dispatching a block hands over
    // its params and stops there, so a listing resolves records wherever the
    // template decides. If this layer ever queries again, this fails.
    for (const nodeType of LISTING_BLOCK_NODE_TYPES) {
      await render({ type: nodeType, attrs: { limit: 3 } });
    }

    for (const [name, endpoint] of Object.entries(endpoints)) {
      expect(endpoint, `${name} was called`).not.toHaveBeenCalled();
    }
  });

  it("hands the block's parameters to the entry", async () => {
    await render({
      type: "eventListing",
      attrs: { listingType: "past", limit: "3", tags: "jazz, live" },
    });

    expect(calls.eventListing).toMatchObject({
      listingType: "past",
      limit: 3,
      tags: ["jazz", "live"],
    });
  });

  it("validates an author's attributes before the entry sees them", async () => {
    // Attributes are author-editable, so they are untrusted input. A value the
    // endpoint would choke on drops out here rather than being forwarded.
    await render({
      type: "eventListing",
      attrs: { limit: "0", orderBy: "; drop table" },
    });

    expect(calls.eventListing).toMatchObject({ limit: null, orderBy: null });
  });

  it("parses a node with the parser for its own type", async () => {
    // The pages endpoint applies no page size, so that block never serializes
    // one. Reading a node with another listing's parser would invent the param.
    await render({ type: "pageListing", attrs: { limit: "3" } });
    await render({ type: "productListing", attrs: { limit: "3" } });

    expect(calls.pageListing).not.toHaveProperty("limit");
    expect(calls.productListing).toMatchObject({ limit: 3 });
  });

  it.each(LISTING_BLOCK_NODE_TYPES)(
    "routes %s to its own entry",
    async (type) => {
      await expect(render({ type })).resolves.toContain(`${type} rendered`);
    },
  );

  it("covers every listing node type in the contract", () => {
    expect(Object.keys(listingHandlers(stubRenderers())).sort()).toEqual(
      [...LISTING_BLOCK_NODE_TYPES].sort(),
    );
  });

  it("registers no handler for a listing a caller left off the map", () => {
    // Entries are optional, so a template can opt out of a listing type. It has
    // to stay unregistered rather than register a handler that renders nothing,
    // or the SDK could not fall back to its own renderer.
    expect(Object.keys(listingHandlers({ eventListing: () => null }))).toEqual([
      "eventListing",
    ]);
  });

  it("suspends an entry that resolves its own records", async () => {
    // The SDK's handlers are synchronous, so an entry that fetches returns a
    // component that awaits. Wrapping it here is what lets that work at all.
    const Resolving = async () => <p>{(await Promise.resolve(["Gig"]))[0]}</p>;

    const html = await renderContent(contentWith({ type: "eventListing" }), {
      ...stubRenderers(),
      eventListing: () => <Resolving />,
    });

    expect(html).toContain("Gig");
  });

  it("keeps the surrounding content when an entry fails", async () => {
    const Failing = async () => {
      throw new Error("endpoint is down");
    };

    const html = await renderContent(
      contentWith(
        paragraph("Prose before"),
        { type: "eventListing" },
        paragraph("Prose after"),
      ),
      { ...stubRenderers(), eventListing: () => <Failing /> },
    );

    expect(html).toContain("Prose before");
    expect(html).toContain("Prose after");
  });

  it("keeps the surrounding content when an entry throws synchronously", async () => {
    // An entry runs inside the boundaries, not while they are being built. If
    // it is called eagerly as a JSX argument the throw escapes them both and
    // fatals the whole document — losing the prose either side of the block,
    // not just the listing. This layer is destined for the SDK, where the entry
    // is another template's code.
    const html = await renderContent(
      contentWith(
        paragraph("Prose before"),
        { type: "eventListing" },
        paragraph("Prose after"),
      ),
      {
        ...stubRenderers(),
        eventListing: () => {
          throw new Error("a template's entry blew up");
        },
      },
    );

    expect(html).toContain("Prose before");
    expect(html).toContain("Prose after");
  });

  it("renders an entry that needs no records without suspending", () => {
    // An entry is free not to fetch at all. Nothing here forces a boundary to
    // resolve first, so such a listing lands in the static markup.
    const html = renderToStaticMarkup(
      <VenueContent
        content={contentWith({ type: "eventListing" })}
        components={listingHandlers(stubRenderers())}
      />,
    );

    expect(html).toContain("eventListing rendered");
  });
});
