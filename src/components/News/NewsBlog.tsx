import { type Page as VenuePage, getLocalizedContent } from "@venuecms/sdk";
import { getLocale } from "next-intl/server";

import { cachedGetNews } from "@/lib/utils";
import { VenueContent } from "@/lib/utils/renderer";
import { PageWithParent } from "@/lib/utils/tree";

import { PageTree } from "../PageTree";
import { VenueImage } from "../VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { renderedStyles } from "../utils";
import { NewsDateList } from "./NewsDateList";
import { NewsListItem } from "./NewsListItem";

export const NewsBlog = async ({
  page,
  pages,
}: {
  page: VenuePage;
  pages: Array<PageWithParent>;
}) => {
  const locale = await getLocale();
  const { content } = getLocalizedContent(page?.localizedContent, locale);

  const { data: news } = await cachedGetNews({ limit: 60, dir: "desc" });
  const articles = news?.records ?? [];

  return (
    <TwoColumnLayout>
      <ColumnLeft>
        <div className="flex flex-col gap-12">
          <div>{content.title}</div>
          {page.image ? <VenueImage image={page.image} /> : null}
          {content.content ? (
            <VenueContent
              className="flex flex-col gap-6 text-sm"
              content={content}
              contentStyles={renderedStyles}
            />
          ) : null}
          <PageTree pages={pages} />
          <NewsDateList />
        </div>
      </ColumnLeft>

      <ColumnRight>
        {articles.length ? (
          <div className="flex flex-col gap-x-8">
            {articles.map((article) => (
              <NewsListItem key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary">No news yet.</p>
        )}
      </ColumnRight>
    </TwoColumnLayout>
  );
};
