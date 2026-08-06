import type { Page as VenuePage } from "@venuecms/sdk-next";

/**
 * Where a page record links. News articles have their own route, a LINK page
 * points somewhere else entirely, and everything else lives under /p — the
 * same routing the nav and the page tree apply.
 */
export const resolvePageHref = ({
  slug,
  type,
  linkUrl,
}: Pick<VenuePage, "slug" | "type"> & { linkUrl?: string | null }) => {
  if (type === "LINK" && linkUrl) {
    return { href: linkUrl, isExternal: true };
  }

  return {
    href: type === "NEWS" ? `/news/${slug}` : `/p/${slug}`,
    isExternal: false,
  };
};
