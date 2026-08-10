import { describe, expect, it } from "vitest";

import { resolveNewsArticleHref, resolvePageHref } from "./pageHref";

describe("resolvePageHref", () => {
  it("routes a content page through /p", () => {
    expect(resolvePageHref({ slug: "about", type: "CONTENT" })).toEqual({
      href: "/p/about",
      target: "_self",
    });
  });

  it.each(["events", "archive", "shop"])(
    "routes the reserved root %s page to its own index, not /p",
    (slug) => {
      // These slugs have real routes; /p/<slug> renders an empty stub, so a
      // nav item or listing that linked there would be a dead end.
      expect(resolvePageHref({ slug, type: "CONTENT" }).href).toBe(`/${slug}`);
    },
  );

  it("leaves a nested page on /p even when it shares a reserved slug", () => {
    // The reservation is about root routes; a child page named "shop" is a
    // normal page and /p/shop is where it lives.
    expect(
      resolvePageHref({ slug: "shop", type: "CONTENT", parentId: "parent-id" })
        .href,
    ).toBe("/p/shop");
  });

  it("routes a news page to /p, where the news view renders it", () => {
    // A NEWS *page* record is a news landing page, not an article — the
    // article route is resolveNewsArticleHref.
    expect(resolvePageHref({ slug: "news", type: "NEWS" }).href).toBe(
      "/p/news",
    );
  });

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

describe("resolveNewsArticleHref", () => {
  it("routes an article to the news route", () => {
    expect(resolveNewsArticleHref("spring-tour")).toBe("/news/spring-tour");
  });
});
