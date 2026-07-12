import { Page } from "@/components";
import { Params } from "@/types";
import { type Page as VenuePage } from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { cachedGetPages } from "@/lib/utils";
import { PageWithParent } from "@/lib/utils/tree";

import { setupSSR } from "@/components/utils";

const getLatestNewsPage = (pages: Array<VenuePage>) =>
  pages
    .filter((page) => page.type === "NEWS")
    .sort((a, b) => {
      const dateA = typeof a.date === "string" ? Date.parse(a.date) : 0;
      const dateB = typeof b.date === "string" ? Date.parse(b.date) : 0;
      return dateB - dateA;
    })[0];

const NewsPage = async ({ params }: { params: Promise<Params> }) => {
  await setupSSR({ params });

  try {
    const { data: pages } = await cachedGetPages();

    if (!pages) {
      notFound();
    }

    const records = pages.records as Array<PageWithParent>;
    const newsPage = getLatestNewsPage(records);

    if (!newsPage) {
      notFound();
    }

    return <Page page={newsPage} pages={records} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
};

export default NewsPage;
