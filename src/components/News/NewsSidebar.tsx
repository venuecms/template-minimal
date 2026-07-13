import { getLocalizedContent } from "@venuecms/sdk";
import { getLocale } from "next-intl/server";

import { type NewsSidebarItem, NewsSidebarList } from "./NewsSidebarList";
import { NEWS_PAGE_SIZE, getNewsRecords } from "./utils";

export const NewsSidebar = async ({
  currentSlug,
}: {
  currentSlug?: string;
}) => {
  const [locale, records] = await Promise.all([getLocale(), getNewsRecords()]);

  if (!records.length) return null;

  const items: NewsSidebarItem[] = records.map((article) => ({
    slug: article.slug ?? "",
    title:
      getLocalizedContent(article.localizedContent, locale).content.title ?? "",
  }));

  const currentIndex = currentSlug
    ? records.findIndex((record) => record.slug === currentSlug)
    : -1;
  const initialPage =
    currentIndex >= 0 ? Math.floor(currentIndex / NEWS_PAGE_SIZE) : 0;

  return (
    <NewsSidebarList
      items={items}
      currentSlug={currentSlug}
      initialPage={initialPage}
      pageSize={NEWS_PAGE_SIZE}
    />
  );
};
