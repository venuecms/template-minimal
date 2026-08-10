import { NewsView } from "@/components";
import { Params } from "@/types";
import { type SearchParams } from "@venuecms/sdk-next";

import { setupSSR } from "@/components/utils";

const NewsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  // Read here and handed down because only a route segment can: a listing block
  // sits too deep inside the content to ask for the URL it is being paged by.
  searchParams: Promise<SearchParams>;
}) => {
  await setupSSR({ params });

  return <NewsView searchParams={await searchParams} />;
};

export default NewsPage;
