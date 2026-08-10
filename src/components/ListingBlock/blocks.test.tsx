/**
 * What the template still owns of a listing block: layout, and the pager.
 *
 * The SDK parses the block's filters off the node, validates them, queries the
 * endpoint, does the page arithmetic and builds the hrefs — none of that is
 * tested here, because none of it is ours. These blocks are plain functions of
 * the props they are handed, so this pins what is still a template decision:
 * which list component draws each record type, what a block does when it has
 * nothing worth drawing, and when a pager is worth drawing at all.
 */
import type {
  ListingPagination,
  ListingRecords,
  Site,
} from "@venuecms/sdk-next";
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

/**
 * A block's pagination as the SDK resolves it.
 *
 * The default is the ordinary middle of a listing — a page with one either
 * side — so a case that cares about an edge overrides only the field that puts
 * it there.
 */
const pagination = (
  overrides: Partial<ListingPagination> = {},
): ListingPagination => ({
  page: 1,
  pageNumber: 2,
  pageSize: 10,
  count: 30,
  pageCount: 3,
  hasPrev: true,
  hasNext: true,
  links: {
    param: "eventListing",
    prevHref: "?eventListing=0",
    nextHref: "?eventListing=2",
    hrefs: [],
  },
  ...overrides,
});

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
        pagination={null}
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
        pagination={null}
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
      <ProductListingBlock
        records={records.product("A record")}
        site={site}
        pagination={null}
      />,
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
        pagination={null}
      />,
    );

    expect(html).toContain("An artist");
  });

  it.each([
    [
      "an event listing",
      () => <EventListingBlock records={[]} site={site} pagination={null} />,
    ],
    [
      "a news listing",
      () => <NewsListingBlock records={[]} site={site} pagination={null} />,
    ],
    ["a page listing", () => <PageListingBlock records={[]} site={site} />],
    [
      "a product listing",
      () => <ProductListingBlock records={[]} site={site} pagination={null} />,
    ],
    [
      "a profile listing",
      () => <ProfileListingBlock records={[]} site={null} pagination={null} />,
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
        <EventListingBlock
          records={records.event("A record")}
          site={null}
          pagination={null}
        />
      ),
    ],
    [
      "a news listing",
      () => (
        <NewsListingBlock
          records={records.news("A record")}
          site={null}
          pagination={null}
        />
      ),
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
          pagination={null}
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

/**
 * The pager.
 *
 * The hrefs are the SDK's — it is the only party that can build them, since the
 * block cannot read the URL it is being paged by. What is tested here is the
 * template's half: whether a pager is drawn at all, and that both directions
 * reach the reader when they exist.
 */
describe("a listing block's pager", () => {
  const renderEvents = (paginationProp: ListingPagination | null) =>
    render(
      <EventListingBlock
        records={records.event("A gig")}
        site={site}
        pagination={paginationProp}
      />,
    );

  it("links both directions from the middle of a listing", async () => {
    const html = await renderEvents(pagination());

    expect(html).toContain("eventListing=0");
    expect(html).toContain("eventListing=2");
  });

  it("draws no pager when the author set no page size", async () => {
    // A null pagination means the endpoint returned every record, so there are
    // no pages to move between.
    const html = await renderEvents(null);

    expect(html).toContain("A gig");
    expect(html).not.toContain("<nav");
  });

  it("draws no pager when the route threaded no search params", async () => {
    // Without them the SDK cannot build an href, and says so with a null
    // `links` rather than hrefs that all point at the current page. The records
    // still render — only the pager is lost.
    const html = await renderEvents(pagination({ links: null }));

    expect(html).toContain("A gig");
    expect(html).not.toContain("<nav");
  });

  it("draws no pager when the whole listing fits on one page", async () => {
    const html = await renderEvents(
      pagination({
        page: 0,
        pageNumber: 1,
        count: 1,
        pageCount: 1,
        hasPrev: false,
        hasNext: false,
        links: {
          param: "eventListing",
          prevHref: null,
          nextHref: null,
          hrefs: [],
        },
      }),
    );

    expect(html).toContain("A gig");
    expect(html).not.toContain("<nav");
  });

  it("trusts the hrefs over the booleans beside them", async () => {
    // `hasPrev`/`hasNext` and the hrefs describe the same fact, and the pager
    // renders hrefs — so if the SDK ever suppresses an href without clearing
    // the matching boolean (it already clamps `nextHref` at MAX_PAGE), the
    // pager must stay away rather than draw two dead arrows.
    const html = await renderEvents(
      pagination({
        hasPrev: true,
        hasNext: true,
        links: {
          param: "eventListing",
          prevHref: null,
          nextHref: null,
          hrefs: [],
        },
      }),
    );

    expect(html).toContain("A gig");
    expect(html).not.toContain("<nav");
  });

  it("names each pager so several on a page stay tellable apart", async () => {
    // Landmarks that all announce "Pagination" leave a screen-reader user no
    // way to know which listing each one moves.
    const html = await renderEvents(pagination());

    expect(html).toContain('aria-label="Events pagination"');
  });

  it("keeps a way back from a page that turned out to be empty", async () => {
    // Reachable without anyone doing anything wrong: with no count to divide,
    // the SDK offers a next link whenever a page comes back full, so the page
    // after a listing whose length is an exact multiple of the page size is
    // empty. Dropping the pager with the records would strand the reader there.
    const html = await render(
      <EventListingBlock
        records={[]}
        site={site}
        pagination={pagination({ count: null, pageCount: null })}
      />,
    );

    expect(html).toContain("eventListing=0");
  });

  it("still renders nothing for an empty first page", async () => {
    // Nothing behind the reader and nothing to show: the block is genuinely
    // empty, and an empty state mid-prose would read as the author's own words.
    const html = await render(
      <EventListingBlock
        records={[]}
        site={site}
        pagination={pagination({
          page: 0,
          pageNumber: 1,
          hasPrev: false,
          links: {
            param: "eventListing",
            prevHref: null,
            nextHref: "?eventListing=1",
            hrefs: [],
          },
        })}
      />,
    );

    expect(html).toBe("");
  });
});
