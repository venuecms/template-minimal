import { NewsView, Page } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getLocalizedContent } from "@venuecms/sdk-next";
import { getPage, getPages } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";

import { PageWithParent } from "@/lib/utils/tree";

import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(getPage);

const PagePage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug, locale } = await params;
  await setupSSR({ params });

  try {
    const { data: page } = await getPage({ slug });
    const { data: pages } = await getPages();

    if (!page || !pages) {
      notFound();
    }

    if (page.type === "NEWS" || page.type === "NEWSLIST") {
      const { content } = getLocalizedContent(page.localizedContent, locale);
      return <NewsView title={content.title ?? undefined} />;
    }

    return <Page page={page} pages={pages.records as Array<PageWithParent>} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
};

export default PagePage;
