import { notFound } from "next/navigation";

import { cachedGetNewsArticle } from "@/lib/utils";

import { NewsArticle } from "./NewsArticle";
import { getNewsRecords } from "./utils";

// The canonical News view: latest article with the paginated sidebar. Shared by
// the /news route and any page with type "NEWS".
export const NewsView = async ({ title }: { title?: string }) => {
  const records = await getNewsRecords();
  const latest = records[0];

  if (!latest?.slug) {
    notFound();
  }

  const { data: article } = await cachedGetNewsArticle({ slug: latest.slug });

  if (!article) {
    notFound();
  }

  return <NewsArticle article={article} title={title} />;
};
