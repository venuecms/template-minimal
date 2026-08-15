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
    expect(resolvePageListingLayout("PROFILELIST")).toBeNull();
  });

  it("leaves a page type this template has never heard of on the page layout", () => {
    expect(resolvePageListingLayout("SOMETHING_NEW")).toBeNull();
  });
});
