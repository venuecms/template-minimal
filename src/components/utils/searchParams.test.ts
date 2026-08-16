import { describe, expect, it } from "vitest";

import { buildPageHref } from "./searchParams";

describe("buildPageHref", () => {
  it("pages against the path it was given", () => {
    expect(buildPageHref("/p/merch", {}, 2)).toBe("/p/merch?page=2");
  });

  it("replaces the page it was handed rather than repeating it", () => {
    expect(buildPageHref("/p/merch", { page: "1" }, 2)).toBe("/p/merch?page=2");
  });

  // Without this a listing block in the page's body snaps back to page 0.
  it("carries a listing block's own param through", () => {
    expect(buildPageHref("/p/merch", { evt_9k3z1: "3" }, 1)).toBe(
      "/p/merch?evt_9k3z1=3&page=1",
    );
  });

  it("keeps every value of a repeated param", () => {
    expect(buildPageHref("/archive", { tag: ["a", "b"] }, 1)).toBe(
      "/archive?tag=a&tag=b&page=1",
    );
  });

  it("drops a param the URL left empty", () => {
    expect(buildPageHref("/archive", { tag: undefined }, 1)).toBe(
      "/archive?page=1",
    );
  });
});
