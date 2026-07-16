import { getNews } from "@venuecms/sdk-next";

export const NEWS_PAGE_SIZE = 8;

const NEWS_FETCH_LIMIT = 100;

// Ordered newest-first. Cached per request so sidebar, article nav and the
// news view all share a single fetch.
export const getNewsRecords = async () => {
  const { data } = await getNews({
    limit: NEWS_FETCH_LIMIT,
    dir: "desc",
  });
  return data?.records ?? [];
};
