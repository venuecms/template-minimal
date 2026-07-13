import { ArrowLeft, ArrowRight } from "lucide-react";

import { Link } from "@/lib/i18n";

export const NewsArticleNav = ({
  newerSlug,
  olderSlug,
}: {
  newerSlug?: string | null;
  olderSlug?: string | null;
}) => {
  if (!newerSlug && !olderSlug) return null;

  return (
    <nav
      aria-label="News pagination"
      className="mt-8 flex items-center justify-between gap-4 text-sm"
    >
      {newerSlug ? (
        <Link
          href={`/news/${newerSlug}`}
          className="flex items-center gap-2 text-secondary hover:text-primary"
        >
          <ArrowLeft className="size-5" />
          Newer
        </Link>
      ) : (
        <span />
      )}

      {olderSlug ? (
        <Link
          href={`/news/${olderSlug}`}
          className="flex items-center gap-2 text-secondary hover:text-primary"
        >
          Older
          <ArrowRight className="size-5" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
};
