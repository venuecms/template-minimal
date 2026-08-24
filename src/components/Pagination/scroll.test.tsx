/**
 * Where a pager leaves the reader's viewport.
 *
 * Kept apart from index.test.tsx because it has to stub `@/lib/i18n` to observe
 * something that never reaches the DOM: `scroll` is an instruction to Next's
 * router, not an attribute, so SSR'd HTML cannot show it. That file renders the
 * real next-intl Link and pins hrefs; this one trades that for prop visibility.
 *
 * The distinction being pinned is between a pager that owns the whole page and
 * one that sits mid-prose. `/archive` and `/shop` are the listing, so paging
 * them to the top of the new page is the conventional read. A listing block is
 * a few records inside an article the reader is part-way through, and scrolling
 * them to the top throws them out of the thing they were reading — which is
 * what made paging a block feel like a page reload.
 */
import type { ListingPagination } from "@venuecms/sdk-next";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { PaginatedListing } from "@/components/ListingBlock/ListingRoot";

import { PaginationLinks } from "./index";

vi.mock("@/lib/i18n", () => ({
  Link: ({
    href,
    scroll,
    children,
  }: {
    href: string;
    scroll?: boolean;
    children: ReactNode;
  }) => (
    <a href={href} data-scroll={String(scroll)}>
      {children}
    </a>
  ),
}));

const render = async (node: ReactNode) => {
  const stream = await renderToReadableStream(node);
  await stream.allReady;
  return new Response(stream).text();
};

/** Both directions live, which is what puts two anchors in the output. */
const pagination = (): ListingPagination => ({
  page: 1,
  pageNumber: 2,
  pageSize: 10,
  count: 30,
  pageCount: 3,
  hasPrev: true,
  hasNext: true,
  links: {
    param: "evt",
    prevHref: "?",
    nextHref: "?evt=2",
    hrefs: [],
  },
});

describe("PaginationLinks", () => {
  it("scrolls to the top by default, as a whole-page pager wants", async () => {
    const html = await render(
      <PaginationLinks prevHref="/archive?page=1" nextHref="/archive?page=3" />,
    );

    expect(html).not.toContain('data-scroll="false"');
    expect(html).toContain('data-scroll="true"');
  });

  it("can be told to leave the viewport where it is", async () => {
    const html = await render(
      <PaginationLinks
        prevHref="/archive?page=1"
        nextHref="/archive?page=3"
        scroll={false}
      />,
    );

    // Both directions, so paging backwards out of a block does not jump either.
    expect(html.match(/data-scroll="false"/g)).toHaveLength(2);
    expect(html).not.toContain('data-scroll="true"');
  });
});

describe("PaginatedListing", () => {
  it("pages without moving the reader out of the article", async () => {
    const html = await render(
      <PaginatedListing
        pagination={pagination()}
        records={[{ id: "one" }]}
        label="Events"
      >
        <p>records</p>
      </PaginatedListing>,
    );

    expect(html.match(/data-scroll="false"/g)).toHaveLength(2);
    expect(html).not.toContain('data-scroll="true"');
  });
});
