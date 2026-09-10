import { getLocalizedContent } from "@venuecms/sdk-next";
import { getLocale, getTranslations } from "next-intl/server";

import { type NewsSidebarItem, NewsSidebarList } from "./NewsSidebarList";
import { NEWS_PAGE_SIZE, getNewsRecords } from "./utils";

export const NewsSidebar = async ({
  currentSlug,
  /**
   * Heading for the sidebar. Falls back to the translated "News" when the
   * caller has no page title to pass — defaulted in the body rather than in the
   * signature, since the fallback has to be read from the request's messages.
   */
  title,
}: {
  currentSlug?: string;
  title?: string;
}) => {
  const [locale, records, t] = await Promise.all([
    getLocale(),
    getNewsRecords(),
    getTranslations("news"),
  ]);

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
    <div className="flex flex-col gap-[4.5rem]">
      <h2 className="hidden text-base text-secondary lg:block">
        {title ?? t("news")}
      </h2>
      <NewsSidebarList
        items={items}
        currentSlug={currentSlug}
        initialPage={initialPage}
        pageSize={NEWS_PAGE_SIZE}
      />
    </div>
  );
};
