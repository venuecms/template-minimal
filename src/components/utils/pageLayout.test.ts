import { describe, expect, it } from "vitest";

import { resolvePageListingLayout } from "./pageLayout";

describe("resolvePageListingLayout", () => {
  it("maps each listing page type to the layout that frames it", () => {
    expect(resolvePageListingLayout("NEWSLIST")).toBe("news");
    expect(resolvePageListingLayout("EVENTLIST")).toBe("events");
    expect(resolvePageListingLayout("PROFILELIST")).toBe("profiles");
    expect(resolvePageListingLayout("PRODUCTLIST")).toBe("products");
  });

  // Where this template's dispatch has always sent it.
  it("keeps a news article on the news view", () => {
    expect(resolvePageListingLayout("NEWS")).toBe("news");
  });

  it("leaves an ordinary page on the page layout", () => {
    expect(resolvePageListingLayout("CONTENT")).toBeNull();
    expect(resolvePageListingLayout("LINK")).toBeNull();
  });

  it("leaves a page type this template has never heard of on the page layout", () => {
    expect(resolvePageListingLayout("SOMETHING_NEW")).toBeNull();
  });
});
