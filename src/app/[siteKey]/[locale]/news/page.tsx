import { NewsArticle } from "@/components";
import { Params } from "@/types";
import { notFound } from "next/navigation";

import { cachedGetNews, cachedGetNewsArticle } from "@/lib/utils";

import { setupSSR } from "@/components/utils";

const NewsPage = async ({ params }: { params: Promise<Params> }) => {
  await setupSSR({ params });

  try {
    const { data: news } = await cachedGetNews({ limit: 60, dir: "desc" });
    const latest = news?.records?.[0];

    if (!latest?.slug) {
      notFound();
    }

    const { data: article } = await cachedGetNewsArticle({ slug: latest.slug });

    if (!article) {
      notFound();
    }

    return <NewsArticle article={article} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
};

export default NewsPage;
