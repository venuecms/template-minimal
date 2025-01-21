import { Page } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getPage, getPages, setConfig } from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { PageWithParent } from "@/lib/utils/tree";

export const generateMetadata = getGenerateMetadata(getPage);

const PagePage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug, siteKey } = await params;
  setConfig({ siteKey });

  const { data: page } = await getPage({ slug });
  const { data: pages } = await getPages();

  if (!page || !pages) {
    notFound();
  }

  return <Page page={page} pages={pages.records as Array<PageWithParent>} />;
};

export default PagePage;
