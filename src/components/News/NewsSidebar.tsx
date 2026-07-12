import { type Page as VenuePage, getLocalizedContent } from "@venuecms/sdk";
import { format } from "date-fns";
import { getLocale } from "next-intl/server";

import { Link } from "@/lib/i18n";
import { cachedGetNews, cn } from "@/lib/utils";

export const NewsSidebar = async ({
  currentSlug,
}: {
  currentSlug?: string;
}) => {
  const locale = await getLocale();
  const { data: news } = await cachedGetNews({ limit: 60, dir: "desc" });
  const articles = news?.records ?? [];

  if (!articles.length) return null;

  return (
    <nav className="flex flex-col gap-4 text-sm">
      {articles.map((article) => {
        const { content } = getLocalizedContent(
          article.localizedContent,
          locale,
        );
        const date =
          typeof article.date === "string"
            ? format(new Date(article.date), "d MMMM yyyy")
            : null;
        const isActive = article.slug === currentSlug;

        return (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className={cn(
              "flex flex-col gap-1",
              isActive ? "text-primary" : "text-secondary",
            )}
          >
            {date ? <span className="text-xs">{date}</span> : null}
            <span className="text-primary">{content.title}</span>
          </Link>
        );
      })}
    </nav>
  );
};
