import { describe, expect, it } from "vitest";

import { resolvePageListingLayout } from "./pageLayout";

describe("resolvePageListingLayout", () => {
  it("maps each listing page type this template draws to its listing", () => {
    expect(resolvePageListingLayout("NEWS")).toBe("news");
    expect(resolvePageListingLayout("NEWSLIST")).toBe("news");
    expect(resolvePageListingLayout("EVENTLIST")).toBe("events");
    expect(resolvePageListingLayout("PRODUCTLIST")).toBe("products");
  });

  it("leaves an ordinary page on the page layout", () => {
    expect(resolvePageListingLayout("CONTENT")).toBeNull();
    expect(resolvePageListingLayout("LINK")).toBeNull();
  });

  it("leaves a profile listing on the page layout, having no index for it", () => {
    // Deliberate, not an oversight: this template has no profiles index — only
    // /artists/<slug> — so a page typed PROFILELIST has nothing to stand in
    // for. It renders its own content, which is the better of the two failures.
    expect(resolvePageListingLayout("PROFILELIST")).toBeNull();
  });

  it("leaves a page type this template has never heard of on the page layout", () => {
    // A page type added to the CMS after this template shipped arrives here as
    // a plain string. Falling back to the page layout is what keeps such a page
    // rendering its own content rather than crashing or blanking.
    expect(resolvePageListingLayout("SOMETHING_NEW")).toBeNull();
  });
});
