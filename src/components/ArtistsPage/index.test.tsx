/**
 * The artist grid behind /artists, and in particular where its pager stops.
 *
 * The profiles endpoint only sometimes returns a count, and the listing this
 * was modelled on answers a missing one by assuming 100 pages — which is what
 * the "next" link here must not do.
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

import { ProfilesListContent } from "./ProfilesListContent";

vi.mock("next/server", () => ({ connection: async () => {} }));

vi.mock("next-intl/server", async () => {
  const dictionary = (await import("@/lib/i18n/dictionaries/en.json")).default;

  return {
    getTranslations:
      async (namespace: keyof typeof dictionary) => (key: string) =>
        (dictionary[namespace] as Record<string, string>)?.[key] ?? key,
  };
});

/** What the listing asks for; a page this long is what implies another. */
const ITEMS_PER_PAGE = 24;

const profile = (slug: string) => ({
  id: slug,
  siteId: "site-id",
  slug,
  localizedContent: [{ siteId: "site-id", locale: "en", title: slug }],
});

let requested: Array<string> = [];
let response: { records: Array<unknown>; count?: number };

beforeEach(() => {
  requested = [];
  response = {
    records: Array.from({ length: ITEMS_PER_PAGE }, (_, i) => profile(`a${i}`)),
  };
  setConfig({ siteKey: "test-site" });

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);
    requested.push(url);

    const body = url.includes("/profiles")
      ? response
      : url.includes("/pages/")
        ? {
            id: "page-id",
            slug: "artists",
            type: "PROFILELIST",
            localizedContent: [
              { siteId: "site-id", locale: "en", title: "Our Roster" },
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

const listing = (currentPage = 1) => (
  <ProfilesListContent locale="en" currentPage={currentPage} />
);

// Hrefs carry the locale because these render through the i18n `Link`.
describe("the profile listing", () => {
  it("pages against /artists", async () => {
    const html = await render(listing());

    expect(html).toContain('href="/en/artists?page=0"');
    expect(html).toContain('href="/en/artists?page=2"');
  });

  it("titles itself from the artists page record", async () => {
    const html = await render(listing());

    expect(html).toContain("Our Roster");
    expect(requested.some((url) => url.includes("/pages/artists"))).toBe(true);
  });

  it("sends a profile's link to its detail route", async () => {
    const html = await render(listing());

    expect(html).toContain('href="/en/artists/a0"');
  });

  it("offers no next page once a short page comes back", async () => {
    response = { records: [profile("only")] };

    const html = await render(listing());

    expect(html).toContain('href="/en/artists?page=0"');
    expect(html).not.toContain("page=2");
  });

  it("stops at the last page when the endpoint returns a count", async () => {
    response = { records: response.records, count: ITEMS_PER_PAGE * 2 };

    const html = await render(listing());

    expect(html).not.toContain("page=2");
  });

  it("offers no previous page from the first one", async () => {
    const html = await render(listing(0));

    expect(html).not.toContain("page=-1");
    expect(html).toContain('href="/en/artists?page=1"');
  });
});
