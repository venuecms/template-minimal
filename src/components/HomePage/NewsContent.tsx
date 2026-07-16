import { getNewsArticle } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";

import { NewsArticle } from "../News/NewsArticle";
import { getNewsRecords } from "../News/utils";

// The canonical News view: latest article with the paginated sidebar. Shared by
// the /news route and any page with type "NEWS".
export const NewsContent = async ({ title }: { title?: string }) => {
  const records = await getNewsRecords();
  const latest = records[0];

  if (!latest?.slug) {
    notFound();
  }

  const { data: article } = await getNewsArticle({ slug: latest.slug });

  if (!article) {
    notFound();
  }

  return <NewsArticle article={article} title={title} />;
};
