import { NewsView } from "@/components";
import { Params } from "@/types";

import { setupSSR } from "@/components/utils";

const NewsPage = async ({ params }: { params: Promise<Params> }) => {
  await setupSSR({ params });

  return <NewsView />;
};

export default NewsPage;
