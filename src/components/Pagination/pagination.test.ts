/**
 * The page arithmetic for a route that paginates, pinned on the edges it used
 * to get wrong.
 *
 * Two of these cases are the bugs this module was written to settle, so they
 * are worth naming: an exactly-full last page must not offer a next (that is
 * the off-by-one `/archive` and `/shop` disagreed about), and a listing whose
 * endpoint reports no `count` must page off the evidence it has rather than
 * assuming a hundred pages exist.
 */
import { MAX_PAGE } from "@venuecms/sdk-next";
import { describe, expect, it } from "vitest";

import {
  PAGE_PARAM,
  readPage,
  routePageHref,
  routePaginationMeta,
} from "./pagination";

const PAGE_SIZE = 50;

/** A full page of records, as far as the arithmetic is concerned. */
const meta = (
  overrides: Partial<Parameters<typeof routePaginationMeta>[0]> = {},
) =>
  routePaginationMeta({
    page: 0,
    pageSize: PAGE_SIZE,
    count: 500,
    pageLength: PAGE_SIZE,
    ...overrides,
  });

describe("routePaginationMeta, with a count", () => {
  it("counts the pages the count implies", () => {
    expect(meta({ count: 500 }).pageCount).toBe(10);
    // A partial last page is still a page.
    expect(meta({ count: 501 }).pageCount).toBe(11);
  });

  it("offers no previous page from the first", () => {
    expect(meta({ page: 0 }).hasPrev).toBe(false);
    expect(meta({ page: 1 }).hasPrev).toBe(true);
  });

  it("offers no next page once the records run out", () => {
    // 100 records at 50 a page is pages 0 and 1, and page 1 is the end of it.
    // This is the off-by-one the two routes disagreed about: the last page is
    // exactly full, so a rule comparing the page index against the page *count*
    // rather than against the last index offers a page that does not exist.
    expect(meta({ page: 0, count: 100, pageLength: 50 }).hasNext).toBe(true);
    expect(meta({ page: 1, count: 100, pageLength: 50 }).hasNext).toBe(false);
  });

  it("offers a next page while records remain", () => {
    expect(meta({ page: 1, count: 120, pageLength: 50 }).hasNext).toBe(true);
  });

  it("keeps paging past a short page the count says is not the end", () => {
    // A page can come back short of the limit without being the last — records
    // dropped after the limit was applied, say. The deleted `/archive` hack
    // stopped dead here, which would strand every page behind it. The count is
    // the better authority while the page is not empty.
    expect(meta({ page: 1, count: 500, pageLength: 47 }).hasNext).toBe(true);
  });

  it("stops on an empty page even when the count claims more", () => {
    // The terminator for a count that over-reports: `/archive` asks for past
    // events only (`lt`), and a count taken before that filter would otherwise
    // march the pager through empty page after empty page. An empty page is
    // unambiguous, so an over-reporting count costs one wasted page, not a walk
    // to the end of the count.
    expect(meta({ page: 2, count: 1000, pageLength: 0 }).hasNext).toBe(false);
  });

  it("gives an empty listing neither direction", () => {
    const empty = meta({ page: 0, count: 0, pageLength: 0 });

    expect(empty.hasPrev).toBe(false);
    expect(empty.hasNext).toBe(false);
    expect(empty.pageCount).toBe(0);
  });
});

describe("routePaginationMeta, without a count", () => {
  // Products and profiles are permitted to report no `count`. The route used to
  // answer that by assuming 100 pages, which rendered links to 99 pages that
  // did not exist.
  it("reports no page count rather than inventing one", () => {
    const countless = meta({ count: null });

    expect(countless.count).toBeNull();
    expect(countless.pageCount).toBeNull();
  });

  it("treats a full page as the only evidence of another", () => {
    expect(meta({ count: null, pageLength: PAGE_SIZE }).hasNext).toBe(true);
  });

  it("stops on a short page", () => {
    expect(meta({ count: null, pageLength: PAGE_SIZE - 1 }).hasNext).toBe(
      false,
    );
    expect(meta({ count: null, pageLength: 0 }).hasNext).toBe(false);
  });
});

describe("routePaginationMeta bounds", () => {
  it("stops offering a next page at the deepest page a URL may name", () => {
    // The page comes off the query string, which is a reader's to edit, and the
    // endpoints page by offset. Without this the countless rule above would
    // hand out next links forever.
    expect(meta({ page: MAX_PAGE - 1, count: null }).hasNext).toBe(true);
    expect(meta({ page: MAX_PAGE, count: null }).hasNext).toBe(false);
  });
});

describe("readPage", () => {
  it("reads the page out of the query string", () => {
    expect(readPage({ [PAGE_PARAM]: "3" })).toBe(3);
  });

  it("starts at the beginning when the URL says nothing", () => {
    expect(readPage({})).toBe(0);
    expect(readPage({ [PAGE_PARAM]: undefined })).toBe(0);
  });

  it("shows the first page rather than breaking on a hand-edited URL", () => {
    expect(readPage({ [PAGE_PARAM]: "banana" })).toBe(0);
    expect(readPage({ [PAGE_PARAM]: "1.5" })).toBe(0);
    expect(readPage({ [PAGE_PARAM]: "" })).toBe(0);
    // A negative page would otherwise walk the pager off the front of the list.
    expect(readPage({ [PAGE_PARAM]: "-5" })).toBe(0);
  });

  it("reads only digits, not everything Number() would take", () => {
    // Number() reads these as 16, 1000 and 7. The middle one is the one that
    // matters: a single garbage query string would otherwise clamp to MAX_PAGE
    // and ask the endpoint for the deepest offset scan it permits.
    expect(readPage({ [PAGE_PARAM]: "0x10" })).toBe(0);
    expect(readPage({ [PAGE_PARAM]: "1e3" })).toBe(0);
    expect(readPage({ [PAGE_PARAM]: " 7 " })).toBe(0);
    expect(readPage({ [PAGE_PARAM]: "Infinity" })).toBe(0);
  });

  it("clamps a page past the end rather than resetting to the first", () => {
    // Resetting would leave the deepest reachable page with no link back.
    expect(readPage({ [PAGE_PARAM]: String(MAX_PAGE + 100) })).toBe(MAX_PAGE);
  });

  it("takes the first value of a repeated param, as a route would", () => {
    expect(readPage({ [PAGE_PARAM]: ["2", "7"] })).toBe(2);
  });
});

describe("routePageHref", () => {
  it("names the page it links to", () => {
    expect(routePageHref({}, "/archive", 2)).toBe("/archive?page=2");
  });

  it("leaves the first page's URL the one a reader arrived on", () => {
    // `?page=0` and a bare `/archive` are the same page, and the bare one is
    // what every other link to the archive uses.
    expect(routePageHref({}, "/archive", 0)).toBe("/archive");
  });

  it("carries the route's other params through", () => {
    // The old href was string concat onto a base URL, so it dropped everything
    // else on the query string the moment either route grew a filter.
    const href = routePageHref({ tag: "live", q: "trio" }, "/archive", 2);

    expect(href).toContain("tag=live");
    expect(href).toContain("q=trio");
    expect(href).toContain("page=2");
  });

  it("carries other params through onto the first page too", () => {
    expect(routePageHref({ tag: "live" }, "/archive", 0)).toBe(
      "/archive?tag=live",
    );
  });

  it("replaces the page it is given rather than repeating it", () => {
    const href = routePageHref(
      { [PAGE_PARAM]: "4", tag: "live" },
      "/archive",
      2,
    );

    expect(href).toContain("page=2");
    expect(href).not.toContain("page=4");
  });

  it("keeps every value of a repeated param", () => {
    const href = routePageHref({ tag: ["live", "dj"] }, "/archive", 1);

    expect(href).toContain("tag=live");
    expect(href).toContain("tag=dj");
  });

  it("escapes what it puts in the query string", () => {
    expect(routePageHref({ q: "a&b=c" }, "/archive", 0)).toBe(
      "/archive?q=a%26b%3Dc",
    );
  });
});
