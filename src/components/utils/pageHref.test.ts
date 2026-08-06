import { describe, expect, it } from "vitest";

import { resolvePageHref } from "./pageHref";

describe("resolvePageHref", () => {
  it("routes a content page through /p", () => {
    expect(resolvePageHref({ slug: "about", type: "CONTENT" })).toEqual({
      href: "/p/about",
      target: "_self",
    });
  });

  it("routes a news article through /news", () => {
    expect(resolvePageHref({ slug: "spring-tour", type: "NEWS" })).toEqual({
      href: "/news/spring-tour",
      target: "_self",
    });
  });

  it.each(["events", "archive", "shop"])(
    "routes the reserved %s page to its own index, not /p",
    (slug) => {
      // These slugs have real routes; /p/<slug> renders an empty stub, so a
      // listing that linked there would be a dead end mid-article.
      expect(resolvePageHref({ slug, type: "CONTENT" }).href).toBe(`/${slug}`);
    },
  );

  it("sends a link page to its target", () => {
    expect(
      resolvePageHref({
        slug: "tickets",
        type: "LINK",
        linkUrl: "https://example.com",
        openInNewTab: true,
      }),
    ).toEqual({ href: "https://example.com", target: "_blank" });
  });

  it("keeps a link page in place when the author asked for it", () => {
    expect(
      resolvePageHref({
        slug: "tickets",
        type: "LINK",
        linkUrl: "https://example.com",
        openInNewTab: false,
      }).target,
    ).toBe("_self");
  });

  it("falls back to /p for a link page with no target", () => {
    expect(
      resolvePageHref({ slug: "tickets", type: "LINK", linkUrl: null }),
    ).toEqual({ href: "/p/tickets", target: "_self" });
  });
});
