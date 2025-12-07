import { LocalizedContent, Page, Site, getLocalizedContent } from "@venuecms/sdk";
import { cachedGetPages } from "@/lib/utils";
import { getLocale } from "next-intl/server";
import { ReactNode } from "react";

import { Link } from "@/lib/i18n";
import { VenueContent } from "@/lib/utils/renderer";

import { renderedStyles } from "../utils";
import { NavMenuDesktop } from "./NavMenuDesktop";
import { NavMenuMobile } from "./NavMenuMobile";

// Static slugs are reserved slugs in the nav that should not be redirected to a /p/[slug] but routed direct instead.
const StaticSlugs = ["events", "archive", "shop"];

export type RootPageContent = {
  page: Page;
  content: LocalizedContent;
  isStatic: boolean;
};

export const Nav = async ({ logo, site }: { logo: ReactNode; site: Site }) => {
  const locale = await getLocale();
  const { data: pages } = await cachedGetPages();

  // Defined in the custom fields for this template under public/_venue/config.schema.json
  const showSearch: boolean =
    !!site.settings?.publicSite?.template?.config?.showSearch;

  // Filter out the root pages to use for the menu
  const rootPages = pages?.records.filter(
    (page) => page.parentId === undefined,
  );

  // Get the localized content for each root page
  const rootPageContents = rootPages?.map((page) => ({
    page,
    content: getLocalizedContent(page.localizedContent, locale).content,
    isStatic: StaticSlugs.includes(page.slug),
  }));

  const menuItems = rootPageContents
    ? rootPageContents.map(({ page, content, isStatic }) => (
        <li key={page.slug}>
          <Link href={`${isStatic ? "/" : "/p/"}${page.slug}`}>
            {content.title}
          </Link>
        </li>
      ))
    : null;

  // Render the menu for desktop and mobile
  return (
    <>
      <NavMenuDesktop showSearch={showSearch}>{menuItems}</NavMenuDesktop>
      <NavMenuMobile
        logo={logo}
        footer={
          site.description ? (
            <VenueContent
              content={{ content: site.description } as LocalizedContent}
              contentStyles={renderedStyles}
            />
          ) : null
        }
      >
        {menuItems}
      </NavMenuMobile>
    </>
  );
};
