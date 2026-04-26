import { NewsArticle } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { notFound } from "next/navigation";

import { cachedGetNewsArticle } from "@/lib/utils";

import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(cachedGetNewsArticle);

const NewsArticlePage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug } = await params;
  await setupSSR({ params });

  try {
    const { data: article } = await cachedGetNewsArticle({ slug });

    if (!article) {
      notFound();
    }

    return <NewsArticle article={article} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
};

export default NewsArticlePage;
