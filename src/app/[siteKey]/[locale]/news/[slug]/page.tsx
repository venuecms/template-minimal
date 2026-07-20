import { NewsArticle, NewsArticleWithSideBar } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getNewsArticle } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";

import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(getNewsArticle);

const NewsArticlePage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug } = await params;
  await setupSSR({ params });

  try {
    const { data: article } = await getNewsArticle({ slug });

    if (!article) {
      notFound();
    }

    return <NewsArticleWithSideBar article={article} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
};

export default NewsArticlePage;
