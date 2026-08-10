/**
 * The pager, pinned from both sides.
 *
 * `Pagination` does its own page arithmetic and is what `/archive` and `/shop`
 * use; `PaginationLinks` takes hrefs already built and is what a listing block
 * inside content uses, since a block does not know the URL it is being paged
 * by. They share the rendering, so these cover the seam between them: the page
 * arithmetic on one side, the disabled direction on the other.
 *
 * The arithmetic itself is pinned in ./pagination.test.ts. What is here is the
 * component's half — which direction becomes a link, and what that link says.
 */
import { NextIntlClientProvider } from "next-intl";
import type { ComponentProps, ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Pagination, PaginationLinks } from "./index";

const render = async (node: ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      {node}
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return new Response(stream).text();
};

describe("PaginationLinks", () => {
  it("links both directions when both exist", async () => {
    const html = await render(
      <PaginationLinks prevHref="/archive?page=1" nextHref="/archive?page=3" />,
    );

    expect(html).toContain("/archive?page=1");
    expect(html).toContain("/archive?page=3");
  });

  it("renders a null direction as something unclickable", async () => {
    // A null href is how "there is no previous page" is spelled, so it must not
    // reach the DOM as a link to nowhere.
    const html = await render(
      <PaginationLinks prevHref={null} nextHref="/archive?page=1" />,
    );

    expect(html).toContain("pointer-events-none");
    expect(html).not.toContain('href="null"');
    expect(html).toContain("/archive?page=1");
  });
});

describe("Pagination", () => {
  /** A route's pager over 500 records at 50 a page: pages 0 through 9. */
  /** An endpoint reply, as the pager reads one. */
  const reply = (count: number | null, pageLength = 50) => ({
    records: Array.from({ length: pageLength }, (_, i) => i),
    count,
  });

  const pager = (props: Partial<ComponentProps<typeof Pagination>> = {}) => (
    <Pagination
      page={0}
      pageSize={50}
      result={reply(500)}
      basePath="/archive"
      searchParams={{}}
      {...props}
    />
  );

  it("counts the next page off the current one", async () => {
    const html = await render(pager({ page: 1 }));

    // Page 0's href is the bare route rather than `?page=0`, so the first page
    // keeps the URL every other link to the archive already uses. The locale
    // prefix is next-intl's Link, which is also what confirms a path-only href
    // still routes — the pager builds `/archive`, not a bare `?page=`.
    expect(html).toContain('href="/en/archive"');
    expect(html).toContain("/archive?page=2");
  });

  it("offers no previous page from the first", async () => {
    const html = await render(pager({ page: 0 }));

    expect(html).not.toContain("page=-1");
    expect(html).toContain("/archive?page=1");
  });

  it("offers no next page from the last", async () => {
    // 500 records at 50 a page ends on page 9, exactly full. `/archive` used to
    // compare the page against the page *count* and so offered a tenth page
    // that does not exist, where `/shop` subtracted one and did not. This is
    // that disagreement settled: there is no total left to disagree about.
    const html = await render(pager({ page: 9 }));

    expect(html).toContain("/archive?page=8");
    expect(html).not.toContain("page=10");
  });

  it("renders nothing when the whole listing fits on one page", async () => {
    await expect(
      render(pager({ page: 0, result: reply(12, 12) })),
    ).resolves.toBe("");
  });

  it("renders nothing when the fetch yielded no result at all", async () => {
    await expect(render(pager({ page: 0, result: null }))).resolves.toBe("");
  });

  it("keeps a link back from an empty page a reader can still land on", async () => {
    // Paging a listing whose endpoint reports no count offers a next whenever a
    // page comes back full, so the page after an exact multiple of the page
    // size is empty. Dropping the pager there would leave a reader in a dead
    // end with no way back.
    const html = await render(pager({ page: 2, result: reply(null, 0) }));

    expect(html).toContain("/archive?page=1");
  });

  it("sends a page past the end back to the last real one", async () => {
    // `readPage` clamps anything up to MAX_PAGE, so /archive?page=400 renders.
    // 500 records at 50 a page means page 9 is the last, and stepping back one
    // at a time from 400 would be hundreds of empty pages and hundreds of
    // offset scans to reach content.
    const html = await render(pager({ page: 400, result: reply(500, 0) }));

    expect(html).toContain("/archive?page=9");
    expect(html).not.toContain("page=399");
  });

  it("carries the route's other query params into both directions", async () => {
    // The old href was `${baseUrl}?page=${n}` by concatenation, so anything
    // else on the query string was dropped the moment a route grew a filter.
    const html = await render(
      pager({ page: 2, searchParams: { tag: "live" } }),
    );

    expect(html).toContain("tag=live&amp;page=1");
    expect(html).toContain("tag=live&amp;page=3");
  });
});
