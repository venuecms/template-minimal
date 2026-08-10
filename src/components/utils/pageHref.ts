import type { Page as VenuePage } from "@venuecms/sdk-next";

/**
 * Root slugs that own a real route. The CMS still holds a page record for each
 * so it can carry a title and a nav position, but linking to /p/<slug> would
 * land on an empty stub instead of the index that actually renders them.
 *
 * Only reserved at the root: a nested page is free to be slugged "shop", and
 * /p/shop is where it lives.
 */
const StaticRootSlugs = ["events", "archive", "shop"];

// `type` and `parentId` are optional because the page tree reads its records
// out of a loosely typed tree-view metadata bag.
type PageLink = Pick<VenuePage, "slug"> & {
  type?: VenuePage["type"];
  parentId?: string | null;
  linkUrl?: string | null;
  openInNewTab?: boolean;
};

/**
 * Where a page record links, and whether it opens in a new tab. The single
 * resolver for page routing — the nav, the page tree and the page listing
 * block all render the same records and previously disagreed about reserved
 * slugs and about honouring `openInNewTab`.
 *
 * Note this deliberately does not route NEWS pages to /news/<slug>: a NEWS
 * *page* record is a news landing page, which /p/<slug> renders as the news
 * view. Individual articles come from the news endpoint, and the news listing
 * block routes those itself.
 */
export const resolvePageHref = ({
  slug,
  type,
  parentId,
  linkUrl,
  openInNewTab,
}: PageLink): { href: string; target: "_blank" | "_self" } => {
  if (type === "LINK" && linkUrl) {
    return { href: linkUrl, target: openInNewTab ? "_blank" : "_self" };
  }

  const isRoot = parentId == null;

  return {
    href: isRoot && StaticRootSlugs.includes(slug) ? `/${slug}` : `/p/${slug}`,
    target: "_self",
  };
};

/** A news article has its own route, separate from the page it may also be. */
export const resolveNewsArticleHref = (slug: string) => `/news/${slug}`;
