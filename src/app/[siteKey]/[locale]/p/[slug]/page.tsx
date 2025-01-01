import { Page } from "@/components";
import { Params } from "@/types";
import { getPage, setConfig } from "@venuecms/sdk";
import { notFound } from "next/navigation";

const PagePage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug, siteKey } = await params;
  setConfig({ siteKey });

  const { data: page } = await getPage({ slug });

  if (!page) {
    notFound();
  }

  return <Page page={page} />;
};

export default PagePage;
