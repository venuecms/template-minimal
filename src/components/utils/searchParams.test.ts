import { MAX_PAGE } from "@venuecms/sdk-next";
import { describe, expect, it } from "vitest";

import { buildPageHref, readPage } from "./searchParams";

describe("readPage", () => {
  it("reads the page the URL names", () => {
    expect(readPage({ page: "3" })).toBe(3);
  });

  it("starts at the first page when the URL names none", () => {
    expect(readPage({})).toBe(0);
  });

  it("takes the first of a repeated param, as a route would", () => {
    expect(readPage({ page: ["1", "2"] })).toBe(1);
  });

  // parseInt would take "12abc" for 12, and a negative page is a negative
  // offset for the endpoint to walk.
  it.each(["not-a-page", "-2", "3abc", "2.5", ""])(
    "starts at the first page rather than sending %j to the endpoint",
    (page) => {
      expect(readPage({ page })).toBe(0);
    },
  );

  /**
   * The SDK reads the page for a listing block out of the same query string
   * this reads the route's page out of, with its own unexported reader. Where
   * the two disagree, one URL means two different pages on one screen: the
   * route's pager builds its hrefs from a page the block is not on.
   *
   * So these cases are not about whether the spelling is a good one — they are
   * about matching `readPage` in @venuecms/sdk-next, which coerces with
   * `Number` and accepts whatever comes back an integer.
   */
  describe("agreeing with the SDK's own reader", () => {
    it("takes an exponent, which Number resolves to a whole page", () => {
      expect(readPage({ page: "1e3" })).toBe(1000);
    });

    it("takes a padded page, which Number trims", () => {
      expect(readPage({ page: " 1" })).toBe(1);
    });
  });

  it("clamps a hand-edited page to the deepest the endpoint will scan", () => {
    expect(readPage({ page: String(MAX_PAGE + 5000) })).toBe(MAX_PAGE);
  });
});

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
