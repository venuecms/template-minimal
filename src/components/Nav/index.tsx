import {
  LocalizedContent,
  Page,
  Site,
  getLocalizedContent,
  getPages,
} from "@venuecms/sdk";
import { getLocale } from "next-intl/server";
import { ReactNode } from "react";

import { Link } from "@/lib/i18n";
import { VenueContent } from "@/lib/utils/renderer";

import { renderedStyles } from "../utils";
import { NavMenuDesktop } from "./NavMenuDesktop";
import { NavMenuMobile } from "./NavMenuMobile";

const StaticSlugs = ["events", "archive"];

export type RootPageContent = {
  page: Page;
  content: LocalizedContent;
  isStatic: boolean;
};

export const Nav = async ({ logo, site }: { logo: ReactNode; site: Site }) => {
  const locale = await getLocale();
  const { data: pages } = await getPages();

  // Filter out the root pages to use for the menu
  const rootPages = pages?.records.filter((page) => !page.parent);

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
      <NavMenuDesktop>{menuItems}</NavMenuDesktop>
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
