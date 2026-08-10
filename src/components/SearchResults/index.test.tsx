import type { LocalizedContent } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { SearchAllRecord, SearchAllResponse } from "../Search/provider";

/**
 * The point of moving to `/search/all` is that the endpoint returns one ranked
 * list spanning every record type, and this template lays that single list out
 * while deriving the per-type filter counts on the client. These tests pin both
 * halves: every record shows up in one list, and the sidebar counts each type.
 *
 * The provider is mocked so the component renders against fixed results without
 * a network round-trip or a react-query Suspense boundary — the SSR output is
 * the default `all` filter, which is the state these assertions describe.
 */
const { results } = vi.hoisted(() => {
  const record = (
    id: string,
    type: SearchAllRecord["type"],
    title: string,
  ): SearchAllRecord => ({
    id,
    type,
    slug: id,
    siteId: "site-id",
    image: null,
    localizedContent: [
      {
        siteId: "site-id",
        locale: "en",
        title,
        content: null,
        shortContent: `${title} blurb`,
      },
    ] as Array<LocalizedContent>,
    similarity: 1,
  });

  const results: SearchAllResponse = {
    records: [
      record("first-event", "event", "First Event"),
      record("second-event", "event", "Second Event"),
      record("a-product", "product", "A Product"),
    ],
  };

  return { results };
});

vi.mock("../Search/provider", () => ({
  useSearchQuery: () => ({ reset: () => {} }),
  useSearchResults: () => ({ isQueryEnabled: true, results }),
}));

import { SearchResults } from "./index";

const renderHtml = async (): Promise<string> => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      <SearchResults>fallback</SearchResults>
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  // React inserts `<!-- -->` markers between adjacent text nodes during SSR;
  // strip them so assertions can match the visible text.
  return (await new Response(stream).text()).replaceAll("<!-- -->", "");
};

describe("SearchResults", () => {
  it("renders every /search/all record in one unified list", async () => {
    const html = await renderHtml();

    expect(html).toContain("First Event");
    expect(html).toContain("Second Event");
    expect(html).toContain("A Product");
  });

  it("counts records per type for the filter sidebar", async () => {
    const html = await renderHtml();

    expect(html).toContain("[ 3 ]"); // all
    expect(html).toContain("[ 2 ]"); // events
    expect(html).toContain("[ 1 ]"); // product
    expect(html).toContain("[ 0 ]"); // profiles and pages have no records
  });
});
