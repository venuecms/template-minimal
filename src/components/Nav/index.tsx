import { getLocalizedContent, getPages } from "@venuecms/sdk";
import { SearchIcon } from "lucide-react";
import { getLocale } from "next-intl/server";

import { Link } from "@/lib/i18n";

const StaticSlugs = ["events", "archive"];

export const Nav = async () => {
  const locale = await getLocale();
  const { data: pages } = await getPages();

  // Filter out the root pages to use for the menu
  const rootPages = pages?.records.filter((page) => !page.parent);

  // Get the localized content for each root page
  const rootPageContents = rootPages?.map((page) => ({
    page,
    content: getLocalizedContent(page.localizedContent, locale).content,
  }));

  // Render the menu
  return (
    <nav className="flex w-full items-center justify-between">
      <ol className="flex items-center gap-8 text-text-nav text-sm font-light">
        {rootPageContents
          ? rootPageContents.map(({ page, content }) => (
              <li key={page.slug}>
                <Link
                  href={`${StaticSlugs.includes(page.slug) ? "/" : "/p/"}${page.slug}`}
                >
                  {content.title}
                </Link>
              </li>
            ))
          : null}
      </ol>
      <div className="gap-8">
        <SearchIcon className="w-6 h-6" />
      </div>
    </nav>
  );
};
