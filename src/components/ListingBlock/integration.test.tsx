/**
 * The whole seam, driven for real.
 *
 * The unit tests either side of this one hand a block a `pagination` object
 * built by hand, which proves the pager's own rules but not that anything ever
 * produces such an object. This runs the real thing end to end: a real content
 * node, the real SDK renderer parsing its attributes and building the query,
 * the real listing handler, and this template's real component map — with only
 * the network stubbed.
 *
 * What that buys is the two ends of the wiring the template actually owns:
 * `searchParams` going *into* `VenueContent` from a route, and an href coming
 * back *out* on the pager. Neither is visible to a test that starts from props.
 *
 * `connection()` is stubbed because the SDK calls it before fetching to opt the
 * listing out of the prerender, and outside a Next request scope it throws.
 * Stubbing it is what lets the handler run at all here; it is not the behaviour
 * under test.
 */
import {
  type LocalizedContent,
  VenueContent,
  setConfig,
} from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { contentComponents, pageBodyStyles } from "./index";

vi.mock("next/server", () => ({ connection: async () => {} }));

const eventRecord = {
  id: "e1",
  siteId: "site-id",
  slug: "gig",
  startDate: "2026-09-01T20:00:00.000Z",
  endDate: "2026-09-01T23:00:00.000Z",
  hasTime: true,
  publishState: "PUBLISHED",
  artists: [],
  localizedContent: [{ siteId: "site-id", locale: "en", title: "A gig" }],
};

/**
 * Content holding the given listing nodes, as the editor serializes them.
 *
 * Cast to the content type rather than to `never`: naming the target is what
 * keeps this fixture honest, so a `LocalizedContent` that gains a required
 * field fails here instead of silently feeding the renderer a shape the SDK
 * would never produce.
 */
const contentWith = (
  ...nodes: Array<Record<string, unknown>>
): LocalizedContent =>
  ({
    siteId: "site-id",
    locale: "en",
    title: "An article",
    contentJSON: { type: "doc", content: nodes },
  }) as unknown as LocalizedContent;

const eventListing = (attrs: Record<string, unknown>) => ({
  type: "eventListing",
  attrs,
});

/**
 * A count far larger than the page size, so the listing genuinely has a next
 * page and the pager has something to draw.
 */
const COUNT = 30;

beforeEach(() => {
  setConfig({ siteKey: "test-site" });

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);
    const body = url.includes("/events")
      ? { records: [eventRecord], count: COUNT }
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
  const errors: string[] = [];
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      {node}
    </NextIntlClientProvider>,
    {
      onError: (error) => {
        errors.push(String(error));
      },
    },
  );
  await stream.allReady;

  return { html: await new Response(stream).text(), errors };
};

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

/**
 * How deeply the first `data-listing` element is nested inside the body
 * container, or -1 if it is not in there at all. 0 means a direct child.
 *
 * Walked off the tag stream because there is no DOM implementation installed
 * and the claim is structural: `pageBodyStyles` exempts listings with
 * `[&>*:not([data-listing])]`, and `>` matches direct children only.
 */
const listingDepthInBody = (html: string) => {
  // Matched on the part of the selector React does not escape, so this does not
  // also become a test of HTML entity encoding.
  const container = html.indexOf(":not([data-listing])]");

  if (container === -1) {
    return -1;
  }

  const tag = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|[^>"])*?)(\/?)>/g;
  tag.lastIndex = html.indexOf(">", container) + 1;

  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = tag.exec(html))) {
    const [, closing, name, attrs, selfClosing] = match;

    if (closing) {
      // Closing the container itself: the listing was never reached.
      if (depth === 0) {
        return -1;
      }

      depth -= 1;
      continue;
    }

    if (attrs.includes("data-listing")) {
      return depth;
    }

    if (!selfClosing && !VOID_TAGS.has(name)) {
      depth += 1;
    }
  }

  return -1;
};

/**
 * The full-width mechanism rests on something this template does not control:
 * the SDK rendering a block's `ListingRoot` as a *direct* child of the body it
 * renders into. If the renderer ever wraps top-level nodes, `>` stops matching,
 * every listing silently collapses to the prose measure, and no assertion made
 * against the class string alone would notice.
 */
describe("a listing block inside a page body", () => {
  it("is a direct child of the body, where the measure exempts it", async () => {
    const { html } = await render(
      <VenueContent
        className={pageBodyStyles}
        content={contentWith(
          { type: "paragraph", content: [{ type: "text", text: "Notes" }] },
          eventListing({ limit: 2 }),
        )}
        contentStyles={contentComponents}
        searchParams={{}}
      />,
    );

    expect(html).toContain("Notes");
    expect(listingDepthInBody(html)).toBe(0);
  });
});

describe("a listing block, end to end", () => {
  it("renders the endpoint's records through this template's list component", async () => {
    const { html, errors } = await render(
      <VenueContent
        content={contentWith(eventListing({ limit: 2 }))}
        contentStyles={contentComponents}
        searchParams={{}}
      />,
    );

    expect(errors).toEqual([]);
    expect(html).toContain("A gig");
  });

  it("asks the endpoint for exactly what the block's attributes said", async () => {
    await render(
      <VenueContent
        content={contentWith(eventListing({ limit: 2 }))}
        contentStyles={contentComponents}
        searchParams={{}}
      />,
    );

    const requested = vi
      .mocked(globalThis.fetch)
      .mock.calls.map(([input]) =>
        input instanceof Request ? input.url : String(input),
      );

    expect(requested.some((url) => url.includes("limit=2"))).toBe(true);
  });

  it("draws a pager whose href the reader can follow to the next page", async () => {
    const { html } = await render(
      <VenueContent
        content={contentWith(eventListing({ limit: 2 }))}
        contentStyles={contentComponents}
        searchParams={{}}
      />,
    );

    expect(html).toContain('aria-label="Events pagination"');
    // The param is the SDK's, derived from what the block is rather than where
    // it sits, so it is matched by shape rather than spelled out here.
    expect(html).toMatch(/href="\?[a-z]+_[a-z0-9]+=1"/);
  });

  it("offers no previous page from the first one", async () => {
    const { html } = await render(
      <VenueContent
        content={contentWith(eventListing({ limit: 2 }))}
        contentStyles={contentComponents}
        searchParams={{}}
      />,
    );

    expect(html).toContain("pointer-events-none");
    expect(html).not.toMatch(/href="\?[a-z]+_[a-z0-9]+=-1"/);
  });

  it("gives two listings on one page a param each", async () => {
    // One shared `?page=` would move both blocks at once. This is the SDK's
    // doing, but it is the thing that makes a pager inside content usable at
    // all, so it is worth failing here if it ever regresses.
    const { html } = await render(
      <VenueContent
        content={contentWith(
          eventListing({ limit: 2 }),
          eventListing({ limit: 2, listingType: "past" }),
        )}
        contentStyles={contentComponents}
        searchParams={{}}
      />,
    );

    const params = [...html.matchAll(/href="\?([a-z]+_[a-z0-9]+)=/g)].map(
      ([, param]) => param,
    );

    expect(params.length).toBe(2);
    expect(new Set(params).size).toBe(2);
  });

  it("renders the records but no pager when the route threaded no search params", async () => {
    // A route that does not pass `searchParams` cannot have hrefs built for it,
    // and the SDK says so with a null `links`. The listing itself still renders.
    const { html } = await render(
      <VenueContent
        content={contentWith(eventListing({ limit: 2 }))}
        contentStyles={contentComponents}
      />,
    );

    expect(html).toContain("A gig");
    expect(html).not.toContain("<nav");
  });
});
