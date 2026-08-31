import { describe, expect, it } from "vitest";

import { resolvePageListingLayout } from "./pageLayout";

describe("resolvePageListingLayout", () => {
  it("maps each listing page type this template draws to its listing", () => {
    expect(resolvePageListingLayout("NEWSLIST")).toBe("news");
    expect(resolvePageListingLayout("EVENTLIST")).toBe("events");
    expect(resolvePageListingLayout("PRODUCTLIST")).toBe("products");
    expect(resolvePageListingLayout("PROFILELIST")).toBe("profiles");
  });

  it("leaves an ordinary page on the page layout", () => {
    expect(resolvePageListingLayout("CONTENT")).toBeNull();
    expect(resolvePageListingLayout("LINK")).toBeNull();
  });

  /**
   * NEWS is a single article, not the index. The news layout renders
   * `records[0]` — whichever article is newest — so mapping NEWS here answered
   * /p/<any-news-slug> with the wrong article, and the newer the site got the
   * more slugs it was wrong for. The page layout renders the record asked for.
   */
  it("leaves a news article on the page layout, which renders the one asked for", () => {
    expect(resolvePageListingLayout("NEWS")).toBeNull();
  });

  it("leaves a page type this template has never heard of on the page layout", () => {
    expect(resolvePageListingLayout("SOMETHING_NEW")).toBeNull();
  });
});
