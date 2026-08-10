import {
  type SearchParams,
  getLocalizedContent,
  getPage,
  getProducts,
  getSite,
} from "@venuecms/sdk-next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ListProduct } from "@/components/ListProduct";
import { Pagination } from "@/components/Pagination";
import { readPage } from "@/components/Pagination/pagination";

const ITEMS_PER_PAGE = 50;

export async function ProductsListContent({
  locale,
  searchParams,
}: {
  locale: string;
  /**
   * Awaited here rather than in the route, because this component already
   * renders inside the shop page's Suspense boundary — and `connection()` above
   * has already opted this subtree out of the prerender, so it costs nothing
   * extra. The page it names decides what to fetch, so this one wait cannot
   * join the `Promise.all` below.
   */
  searchParams: Promise<SearchParams>;
}) {
  await connection();

  const resolvedSearchParams = await searchParams;
  const currentPage = readPage(resolvedSearchParams);

  const [{ data: products }, { data: page }, { data: site }] =
    await Promise.all([
      getProducts({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      }),
      getPage({ slug: "shop" }),
      getSite(),
    ]);

  if (!site) {
    notFound();
  }

  const pageTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : "Shop";

  const topProducts = products?.records.slice(0, 4);
  const moreProducts = products?.records.slice(4);

  return (
    <section className="py-20">
      <div className="grid gap-8 pb-20 sm:max-w-full lg:grid-cols-2 xl:grid-cols-4">
        {topProducts?.length
          ? topProducts.map((product) => (
              <ListProduct
                key={product.slug}
                featured={true}
                product={product}
                site={site}
              />
            ))
          : "No products found"}
      </div>
      {moreProducts?.length ? (
        <div className="grid grid-cols-2 gap-8 sm:max-w-full lg:grid-cols-[repeat(4,minmax(1rem,32rem))] xl:grid-cols-[repeat(6,minmax(1rem,32rem))]">
          {moreProducts.map((product) => (
            <ListProduct key={product.slug} product={product} site={site} />
          ))}
        </div>
      ) : null}
      <Pagination
        page={currentPage}
        pageSize={ITEMS_PER_PAGE}
        result={products}
        basePath="/shop"
        searchParams={resolvedSearchParams}
        label="Shop pagination"
      />
    </section>
  );
}
