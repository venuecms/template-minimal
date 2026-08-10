import { NewsArticle } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { type SearchParams, getNewsArticle } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";

import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(getNewsArticle);

const NewsArticlePage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string } & Params>;
  // Read here and handed down because only a route segment can: a listing block
  // sits too deep inside the content to ask for the URL it is being paged by.
  searchParams: Promise<SearchParams>;
}) => {
  const { slug } = await params;
  await setupSSR({ params });

  // Awaited out here, alongside `params`, rather than at the call site below:
  // the catch turns anything thrown into a 404, and a dynamic-rendering bailout
  // thrown by reading the URL has to reach the framework, not become a
  // not-found page.
  const resolvedSearchParams = await searchParams;

  try {
    const { data: article } = await getNewsArticle({ slug });

    if (!article) {
      notFound();
    }

    return (
      <NewsArticle article={article} searchParams={resolvedSearchParams} />
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
};

export default NewsArticlePage;
