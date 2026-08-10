import { type SearchParams, getNewsArticle } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";

import { NewsArticle } from "./NewsArticle";
import { getNewsRecords } from "./utils";

// The canonical News view: latest article with the paginated sidebar. Shared by
// the /news route and any page with type "NEWS".
export const NewsView = async ({
  title,
  searchParams,
}: {
  title?: string;
  /** Passed straight through to the article, for its listing blocks' pagers. */
  searchParams: SearchParams;
}) => {
  const records = await getNewsRecords();
  const latest = records[0];

  if (!latest?.slug) {
    notFound();
  }

  const { data: article } = await getNewsArticle({ slug: latest.slug });

  if (!article) {
    notFound();
  }

  return (
    <NewsArticle article={article} title={title} searchParams={searchParams} />
  );
};
