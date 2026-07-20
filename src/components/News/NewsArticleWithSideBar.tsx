import {
  type Page as VenuePage,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { VenueContent, VenueImage } from "@venuecms/sdk-next";
import { format } from "date-fns";
import { getLocale } from "next-intl/server";

import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { renderedStyles } from "../utils";
import { NewsArticleNav } from "./NewsArticleNav";
import { NewsSidebar } from "./NewsSidebar";
import { getNewsRecords } from "./utils";

export const NewsArticleWithSideBar = async ({
  article,
  title,
}: {
  article: VenuePage;
  title?: string;
}) => {
  const [locale, records] = await Promise.all([getLocale(), getNewsRecords()]);
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
        <div className="flex flex-col gap-0">
          {" "}
          <h1 className="text-base text-secondary">{content.title}</h1>
          {date ? <div className="text-sm text-muted">{date}</div> : null}
        </div>
        {article.image ? <VenueImage image={article.image} /> : null}
        <VenueContent
          className="flex max-w-[42rem] flex-col gap-6 text-sm"
          content={content}
          contentStyles={renderedStyles}
        />
        <NewsArticleNav newerSlug={newerSlug} olderSlug={olderSlug} />
      </ColumnRight>
    </TwoColumnLayout>
  );
};
