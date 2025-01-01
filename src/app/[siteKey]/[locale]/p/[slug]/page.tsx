import { Page } from "@/components";
import { getPage } from "@venuecms/sdk";
import { notFound } from "next/navigation";

const PagePage = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) => {
  const { slug } = await params;
  const { data: page } = await getPage({ slug });

  if (!page) {
    notFound();
  }

  return <Page page={page} />;
};

export default PagePage;
