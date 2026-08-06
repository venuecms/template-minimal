import { describe, expect, it } from "vitest";

import { resolvePageHref } from "./href";

describe("resolvePageHref", () => {
  it("routes a content page through /p", () => {
    expect(resolvePageHref({ slug: "about", type: "CONTENT" })).toEqual({
      href: "/p/about",
      isExternal: false,
    });
  });

  it("routes a news article through /news", () => {
    expect(resolvePageHref({ slug: "spring-tour", type: "NEWS" })).toEqual({
      href: "/news/spring-tour",
      isExternal: false,
    });
  });

  it("sends a link page to its target", () => {
    expect(
      resolvePageHref({
        slug: "tickets",
        type: "LINK",
        linkUrl: "https://example.com",
      }),
    ).toEqual({ href: "https://example.com", isExternal: true });
  });

  it("falls back to /p for a link page with no target", () => {
    expect(
      resolvePageHref({ slug: "tickets", type: "LINK", linkUrl: null }),
    ).toEqual({ href: "/p/tickets", isExternal: false });
  });
});
