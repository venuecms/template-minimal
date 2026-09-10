import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/lib/i18n";

export const NewsArticleNav = ({
  newerSlug,
  olderSlug,
}: {
  newerSlug?: string | null;
  olderSlug?: string | null;
}) => {
  const t = useTranslations("news");

  if (!newerSlug && !olderSlug) return null;

  return (
    <nav
      aria-label={t("pagination")}
      className="mt-8 flex items-center justify-between gap-4 text-sm"
    >
      {newerSlug ? (
        <Link
          href={`/news/${newerSlug}`}
          aria-label={t("newer_article")}
          className="flex items-center text-secondary hover:text-primary"
        >
          <ArrowLeft className="size-5" />
        </Link>
      ) : (
        <span />
      )}

      {olderSlug ? (
        <Link
          href={`/news/${olderSlug}`}
          aria-label={t("older_article")}
          className="flex items-center text-secondary hover:text-primary"
        >
          <ArrowRight className="size-5" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
};
