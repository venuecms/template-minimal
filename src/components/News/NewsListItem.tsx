import { type Page as VenuePage, getLocalizedContent } from "@venuecms/sdk";
import { format } from "date-fns";
import { useLocale } from "next-intl";
import removeMarkdown from "remove-markdown";

import { Link } from "@/lib/i18n";

import { VenueImage } from "../VenueImage";

export const NewsListItem = ({ article }: { article: VenuePage }) => {
  const locale = useLocale();
  const { content } = getLocalizedContent(article.localizedContent, locale);
  const href = `/news/${article.slug}`;

  const excerpt = content.shortContent
    ? content.shortContent
    : content.content
      ? removeMarkdown(content.content).split("\n")[0]
      : null;

  const date =
    typeof article.date === "string"
      ? format(new Date(article.date), "d MMMM yyyy")
      : null;

  return (
    <article className="flex break-inside-avoid flex-col gap-4 pb-8">
      {article.image ? (
        <Link href={href} className="block w-full">
          <VenueImage image={article.image} aspect="video" />
        </Link>
      ) : null}
      <div className="flex flex-col gap-1 text-sm">
        {date ? <div className="text-secondary">{date}</div> : null}
        <Link href={href} className="text-primary">
          <h3 className="text-base font-medium">{content.title}</h3>
        </Link>
        {excerpt ? (
          <p className="line-clamp-3 text-secondary">{excerpt}</p>
        ) : null}
      </div>
    </article>
  );
};
