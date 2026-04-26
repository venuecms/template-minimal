import { type Page as VenuePage, getLocalizedContent } from "@venuecms/sdk";
import { format } from "date-fns";
import { useLocale } from "next-intl";

import { VenueContent } from "@/lib/utils/renderer";

import { VenueImage } from "../VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { renderedStyles } from "../utils";

export const NewsArticle = ({ article }: { article: VenuePage }) => {
  const locale = useLocale();
  const { content } = getLocalizedContent(article?.localizedContent, locale);

  const date =
    typeof article.date === "string"
      ? format(new Date(article.date), "EEEE d MMMM yyyy")
      : null;

  return (
    <TwoColumnLayout>
      <ColumnLeft>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            {date ? <div className="text-sm text-secondary">{date}</div> : null}
            <h1 className="text-base">{content.title}</h1>
          </div>
          {article.image ? <VenueImage image={article.image} /> : null}
        </div>
      </ColumnLeft>
      <ColumnRight>
        <VenueContent
          className="flex max-w-[42rem] flex-col gap-6 text-sm"
          content={content}
          contentStyles={renderedStyles}
        />
      </ColumnRight>
    </TwoColumnLayout>
  );
};
