import {
  LocalizedContent,
  Page,
  Site,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { getPages } from "@venuecms/sdk-next";
import { getLocale } from "next-intl/server";
import { ReactNode } from "react";

import { Link } from "@/lib/i18n";

import { VenueContent } from "@/components/VenueContent";

import { resolvePageHref } from "../utils/pageHref";
// The site description is a short blurb, so it takes prose styling only — no
// listing blocks to resolve here.
import { renderedStyles } from "../utils/styles";
import { NavMenuDesktop } from "./NavMenuDesktop";
import { NavMenuMobile } from "./NavMenuMobile";

export type RootPageContent = {
  page: Page;
  content: LocalizedContent;
};

export const Nav = async ({ logo, site }: { logo: ReactNode; site: Site }) => {
  const locale = await getLocale();
  const { data: pages } = await getPages();

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
  }));

  const menuItems = rootPageContents
    ? rootPageContents.map(({ page, content }) => {
        const { href, target } = resolvePageHref(page);

        return (
          <li key={page.slug}>
            <Link href={href} target={target}>
              {content.title}
            </Link>
          </li>
        );
      })
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
