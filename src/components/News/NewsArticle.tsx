import {
  type SearchParams,
  VenueContent,
  type Page as VenuePage,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { format } from "date-fns";
import { getLocale } from "next-intl/server";

import { contentComponents } from "@/components/ListingBlock";
import { VenueImage } from "@/components/VenueImage";

import { ProfileCompact } from "../ProfileCompact";
import { ProfileLink } from "../ProfileLink";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { NewsArticleNav } from "./NewsArticleNav";
import { NewsSidebar } from "./NewsSidebar";
import { getNewsRecords } from "./utils";

export const NewsArticle = async ({
  article,
  title,
  searchParams,
}: {
  article: VenuePage;
  title?: string;
  /**
   * The route's search params, for the pagers on any listing blocks in this
   * content. Only a route segment can read them, so they are passed down.
   *
   * Required rather than optional: a caller that forgets it costs every listing
   * in this content its pager, and does so silently — the records still render.
   * A surface that genuinely has no URL to page by passes `{}` and says so.
   */
  searchParams: SearchParams;
}) => {
  const [locale, records] = await Promise.all([getLocale(), getNewsRecords()]);
  const { artists = [] } = article;
  const { content } = getLocalizedContent(article?.localizedContent, locale);

  const index = records.findIndex((record) => record.slug === article.slug);
  const newerSlug = index > 0 ? records[index - 1]?.slug : null;
  const olderSlug =
    index >= 0 && index < records.length - 1 ? records[index + 1]?.slug : null;

  const date =
    typeof article.date === "string"
      ? format(new Date(article.date), "EEEE d MMMM yyyy")
      : null;

  return (
    <TwoColumnLayout>
      <ColumnLeft className="order-last lg:order-none">
        <NewsSidebar currentSlug={article.slug} title={title} />
      </ColumnLeft>
      <ColumnRight className="gap-6">
        <h1 className="text-base text-secondary">{content.title}</h1>
        {date ? <div className="text-sm text-muted">{date}</div> : null}
        {article.image ? <VenueImage image={article.image} /> : null}
        <VenueContent
          className="flex flex-col gap-6 text-sm"
          content={content}
          contentStyles={contentComponents}
          searchParams={searchParams}
        />
        <div className="flex flex-col gap-2">
          {artists.map(({ profile }) => (
            <ProfileLink key={profile.slug} profile={profile} />
          ))}
        </div>
        <NewsArticleNav newerSlug={newerSlug} olderSlug={olderSlug} />
      </ColumnRight>
    </TwoColumnLayout>
  );
};
