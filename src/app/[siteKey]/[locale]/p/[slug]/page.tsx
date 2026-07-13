import { NewsView, Page } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getLocalizedContent } from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { cachedGetPage, cachedGetPages } from "@/lib/utils";
import { PageWithParent } from "@/lib/utils/tree";

import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(cachedGetPage);

const PagePage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug, locale } = await params;
  await setupSSR({ params });

  try {
    const { data: page } = await cachedGetPage({ slug });
    const { data: pages } = await cachedGetPages();

    if (!page || !pages) {
      notFound();
    }

    if (page.type === "NEWS") {
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
