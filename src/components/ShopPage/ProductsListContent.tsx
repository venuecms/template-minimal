import type { SearchParams } from "@venuecms/sdk-next";
import { getProducts, getSite } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ListProduct } from "@/components/ListProduct";
import { Pagination } from "@/components/Pagination";

const ITEMS_PER_PAGE = 50;

/**
 * The records half of the products listing, and its pager. The frame and any
 * page body live in `ProductsListSection`, above the Suspense boundary, so
 * neither waits on this fetch or vanishes with it.
 *
 * No page record is read: this grid has no heading slot to put a title in.
 */
export async function ProductsListContent({
  currentPage,
  basePath,
  searchParams,
}: {
  currentPage: number;
  /** Path the pager builds hrefs against; a listing page pages against its own /p/<slug>. */
  basePath: string;
  searchParams?: SearchParams;
}) {
  await connection();

  const [{ data: products }, { data: site }] = await Promise.all([
    getProducts({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    }),
    getSite(),
  ]);

  if (!site) {
    notFound();
  }

  // Calculate total pages
  const totalPages = products?.count
    ? Math.ceil(products.count / ITEMS_PER_PAGE)
    : 100;

  const topProducts = products?.records.slice(0, 4);
  const moreProducts = products?.records.slice(4);

  return (
    <>
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
      {moreProducts?.length && totalPages > 1 ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages - 1}
          baseUrl={basePath}
          searchParams={searchParams}
        />
      ) : null}
    </>
  );
}
