import { describe, expect, it } from "vitest";

import { resolvePageListingLayout } from "./pageLayout";

describe("resolvePageListingLayout", () => {
  it("maps each listing page type this template draws to its listing", () => {
    expect(resolvePageListingLayout("NEWS")).toBe("news");
    expect(resolvePageListingLayout("NEWSLIST")).toBe("news");
    expect(resolvePageListingLayout("EVENTLIST")).toBe("events");
    expect(resolvePageListingLayout("PRODUCTLIST")).toBe("products");
    expect(resolvePageListingLayout("PROFILELIST")).toBe("profiles");
  });

  it("leaves an ordinary page on the page layout", () => {
    expect(resolvePageListingLayout("CONTENT")).toBeNull();
    expect(resolvePageListingLayout("LINK")).toBeNull();
  });

  it("leaves a page type this template has never heard of on the page layout", () => {
    expect(resolvePageListingLayout("SOMETHING_NEW")).toBeNull();
  });
});
