import { Page } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getPage, getPages } from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { PageWithParent } from "@/lib/utils/tree";

import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(getPage);

const PagePage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug } = await params;
  await setupSSR({ params });

  try {
    const { data: page, error } = await getPage({ slug });
    console.log("page", error);
    const { data: pages } = await getPages();

    if (!page || !pages) {
      notFound();
    }

    return <Page page={page} pages={pages.records as Array<PageWithParent>} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
};

export default PagePage;
