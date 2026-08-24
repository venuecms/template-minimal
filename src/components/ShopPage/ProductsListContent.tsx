import type { SearchParams } from "@venuecms/sdk-next";
import { getProducts, getSite } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ProductsList } from "@/components/ListProduct";
import { Pagination } from "@/components/Pagination";

const ITEMS_PER_PAGE = 50;

/**
 * The records half of the products listing, and its pager. The frame lives in
 * `ProductsLayout`, above the Suspense boundary, so it neither waits on this
 * fetch nor vanishes with it.
 *
 * The grid itself is `ProductsList`, shared with the product listing block: a
 * block an author drops into a page draws the same thing this route does.
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

  const records = products?.records ?? [];

  const totalPages = products?.count
    ? Math.ceil(products.count / ITEMS_PER_PAGE)
    : 100;

  return (
    <>
      {records.length ? (
        <ProductsList products={records} site={site} />
      ) : (
        "No products found"
      )}
      {/* Gated on the page count alone. Gating on there being records past the
          first row, as this once did, dropped the pager on a short last page —
          which is exactly where a reader most needs the link back. */}
      {totalPages > 1 ? (
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
