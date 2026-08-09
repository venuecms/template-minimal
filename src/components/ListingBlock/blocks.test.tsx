/**
 * What the template still owns of a listing block: layout.
 *
 * The SDK parses the block's filters off the node, validates them, queries the
 * endpoint and suspends the result — none of that is tested here, because none
 * of it is ours. These blocks are plain functions of the records they are
 * handed, so this pins the two things that are still template decisions: which
 * list component draws each record type, and what a block does when it has
 * nothing worth drawing.
 */
import type { ListingRecords, Site } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  EventListingBlock,
  NewsListingBlock,
  PageListingBlock,
  ProductListingBlock,
  ProfileListingBlock,
} from "./blocks";

const siteId = "site-id";

const site: Site = {
  id: siteId,
  timeZone: "Europe/Berlin",
  settings: {},
};

const localizedContent = (title: string) => [{ siteId, locale: "en", title }];

/**
 * One builder per record type, each satisfying that type in full.
 *
 * Written out rather than cast from one loose shape: the records differ in what
 * they require, and a cast that papered over that would also hide a block
 * reading a field its records do not carry. Only `title` varies — it is what the
 * assertions look for in the rendered output.
 */
const records = {
  event: (...titles: string[]): ListingRecords["eventListing"] =>
    titles.map((title) => ({
      id: title,
      siteId,
      slug: title,
      startDate: "2026-09-01T20:00:00.000Z",
      endDate: "2026-09-01T23:00:00.000Z",
      hasTime: true,
      publishState: "PUBLISHED",
      artists: [],
      localizedContent: localizedContent(title),
    })),

  news: (...titles: string[]): ListingRecords["newsListing"] =>
    titles.map((title) => ({
      id: title,
      siteId,
      slug: title,
      order: 0,
      featured: false,
      type: "NEWS",
      openInNewTab: false,
      date: "2026-09-01T20:00:00.000Z",
      roles: [],
      localizedContent: localizedContent(title),
    })),

  page: (...titles: string[]): ListingRecords["pageListing"] =>
    titles.map((title) => ({
      id: title,
      siteId,
      slug: title,
      order: 0,
      featured: false,
      type: "CONTENT",
      openInNewTab: false,
      roles: [],
      localizedContent: localizedContent(title),
    })),

  product: (...titles: string[]): ListingRecords["productListing"] =>
    titles.map((title) => ({
      siteId,
      slug: title,
      order: 0,
      featured: false,
      artists: [],
      localizedContent: localizedContent(title),
    })),

  profile: (...titles: string[]): ListingRecords["profileListing"] =>
    titles.map((title) => ({
      siteId,
      slug: title,
      localizedContent: localizedContent(title),
    })),
};

// The list components read the locale, so they need the provider even though
// the blocks themselves render synchronously.
const render = async (block: ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      {block}
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return new Response(stream).text();
};

describe("listing blocks", () => {
  it("renders the records it was handed", async () => {
    const html = await render(
      <EventListingBlock
        records={records.event("First gig", "Second gig")}
        site={site}
      />,
    );

    expect(html).toContain("First gig");
    expect(html).toContain("Second gig");
  });

  it("links a news listing to /news", async () => {
    const html = await render(
      <NewsListingBlock
        records={records.news("An announcement")}
        site={site}
      />,
    );

    expect(html).toContain("An announcement");
    expect(html).toContain("/news/An announcement");
  });

  it("renders a page listing", async () => {
    const html = await render(
      <PageListingBlock records={records.page("A page")} site={site} />,
    );

    expect(html).toContain("A page");
  });

  it("renders a product listing", async () => {
    const html = await render(
      <ProductListingBlock records={records.product("A record")} site={site} />,
    );

    expect(html).toContain("A record");
  });

  it("renders a profile listing without a site", async () => {
    // Profiles are the one listing that reads no site, so a profile card still
    // draws on a site this template cannot read, where the others cannot.
    const html = await render(
      <ProfileListingBlock
        records={records.profile("An artist")}
        site={null}
      />,
    );

    expect(html).toContain("An artist");
  });

  it.each([
    ["an event listing", () => <EventListingBlock records={[]} site={site} />],
    ["a news listing", () => <NewsListingBlock records={[]} site={site} />],
    ["a page listing", () => <PageListingBlock records={[]} site={site} />],
    [
      "a product listing",
      () => <ProductListingBlock records={[]} site={site} />,
    ],
    [
      "a profile listing",
      () => <ProfileListingBlock records={[]} site={null} />,
    ],
  ])("renders nothing for %s with no records", async (_label, block) => {
    // A listing sits mid-prose, where an empty-state message would read as
    // content the author wrote.
    await expect(render(block())).resolves.toBe("");
  });

  it.each([
    [
      "an event listing",
      () => (
        <EventListingBlock records={records.event("A record")} site={null} />
      ),
    ],
    [
      "a news listing",
      () => <NewsListingBlock records={records.news("A record")} site={null} />,
    ],
    [
      "a page listing",
      () => <PageListingBlock records={records.page("A record")} site={null} />,
    ],
    [
      "a product listing",
      () => (
        <ProductListingBlock
          records={records.product("A record")}
          site={null}
        />
      ),
    ],
  ])("renders nothing rather than a siteless %s", async (_label, block) => {
    // The SDK hands over a null site when that read failed, and it fails in-band
    // rather than throwing — so nothing above catches it. This gate is the only
    // thing keeping a null site off a component that types it non-null.
    await expect(render(block())).resolves.toBe("");
  });
});
