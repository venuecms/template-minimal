import type { Page as VenuePage } from "@venuecms/sdk-next";

/**
 * Slugs that own a real route. The CMS still holds a page record for each so
 * it can carry a title and a nav position, but linking to /p/<slug> would land
 * on an empty stub instead of the index that actually renders them.
 */
const StaticSlugs = ["events", "archive", "shop"];

// `type` is optional because the page tree reads its records out of a loosely
// typed tree-view metadata bag; an absent type routes as ordinary content.
type PageLink = Pick<VenuePage, "slug"> & {
  type?: VenuePage["type"];
  linkUrl?: string | null;
  openInNewTab?: boolean;
};

/**
 * Where a page record links, and whether it opens in a new tab.
 *
 * The single resolver for page routing — the nav, the page tree and the
 * listing blocks all render the same records, and previously disagreed about
 * reserved slugs and about honouring `openInNewTab`.
 */
export const resolvePageHref = ({
  slug,
  type,
  linkUrl,
  openInNewTab,
}: PageLink): { href: string; target: "_blank" | "_self" } => {
  if (type === "LINK" && linkUrl) {
    return { href: linkUrl, target: openInNewTab ? "_blank" : "_self" };
  }

  if (type === "NEWS") {
    return { href: `/news/${slug}`, target: "_self" };
  }

  return {
    href: StaticSlugs.includes(slug) ? `/${slug}` : `/p/${slug}`,
    target: "_self",
  };
};
