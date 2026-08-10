/**
 * The archive route's pager, driven for real.
 *
 * `/shop` has the same coverage in ShopPage/ProductsListContent.test.tsx, but
 * `/archive` earns its own because it is the route the arithmetic was bent for:
 * it asks the events endpoint for past events only (`lt`), so its `count` can
 * describe more records than the query will ever return. The rule that keeps
 * that from becoming an endless walk — stop on an empty page — is pinned as a
 * pure function in Pagination/pagination.test.ts; what is pinned here is that
 * the route actually feeds it the endpoint's own reply.
 *
 * `setupSSR` is stubbed because it calls next-intl's `setRequestLocale`, which
 * needs a Next request scope; it is page setup, not the behaviour under test.
 */
import { setConfig } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ArchivePage from "./page";

vi.mock("@/components/utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/components/utils")>()),
  setupSSR: async () => {},
}));

const ITEMS_PER_PAGE = 50;

const event = (n: number) => ({
  id: `e${n}`,
  siteId: "site-id",
  slug: `gig-${n}`,
  startDate: "2020-09-01T20:00:00.000Z",
  endDate: "2020-09-01T23:00:00.000Z",
  hasTime: true,
  publishState: "PUBLISHED",
  artists: [],
  localizedContent: [{ siteId: "site-id", locale: "en", title: `Gig ${n}` }],
});

let eventsResponse: { records: unknown[]; count: number | null } = {
  records: [],
  count: 0,
};

const respondWith = (pageLength: number, count: number | null) => {
  eventsResponse = {
    records: Array.from({ length: pageLength }, (_, i) => event(i)),
    count,
  };
};

beforeEach(() => {
  setConfig({ siteKey: "test-site" });

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);
    const body = url.includes("/events")
      ? eventsResponse
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

const archiveAt = async (
  searchParams: Record<string, string | string[] | undefined>,
) =>
  render(
    await ArchivePage({
      params: Promise.resolve({ siteKey: "test-site", locale: "en" }),
      searchParams: Promise.resolve(searchParams),
    }),
  );

describe("the archive route's pager", () => {
  it("asks the endpoint for the page the URL names", async () => {
    respondWith(ITEMS_PER_PAGE, 500);

    await archiveAt({ page: "3" });

    const requested = vi
      .mocked(globalThis.fetch)
      .mock.calls.map(([input]) =>
        input instanceof Request ? input.url : String(input),
      );

    expect(requested.some((url) => url.includes("page=3"))).toBe(true);
  });

  it("links on to the next page while records remain", async () => {
    respondWith(ITEMS_PER_PAGE, 500);

    expect(await archiveAt({})).toContain("/archive?page=1");
  });

  it("offers no next page from an exactly-full last page", async () => {
    // 100 past events at 50 a page ends on page 1. This is the off-by-one:
    // `/archive` used to compare the page against the page count and offer a
    // third page, where `/shop` subtracted one and did not.
    respondWith(ITEMS_PER_PAGE, 100);

    expect(await archiveAt({ page: "1" })).not.toContain("page=2");
  });

  it("stops rather than marching on when a count outruns the records", async () => {
    // The `lt` filter is why this route needs the empty-page terminator: a
    // count of 1000 with nothing on the page must not offer page 3, or the
    // reader walks empty pages to the end of the count. This is the literal-100
    // bug's successor and the reason the route's old inline hack existed.
    respondWith(0, 1000);

    const html = await archiveAt({ page: "2" });

    expect(html).toContain("No events found");
    expect(html).not.toContain("page=3");
  });

  it("keeps a way back off an empty page", async () => {
    respondWith(0, 1000);

    // Page 1 is the last real page of a 100-record archive; the reader
    // overshot to 2 and must not be stranded there.
    expect(await archiveAt({ page: "2" })).toContain("/archive?page=1");
  });

  it("carries the route's other query params through the pager", async () => {
    respondWith(ITEMS_PER_PAGE, 500);

    expect(await archiveAt({ page: "1", tag: "jazz" })).toContain(
      "tag=jazz&amp;page=2",
    );
  });
});
