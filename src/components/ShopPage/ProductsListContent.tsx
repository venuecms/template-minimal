import { getLocalizedContent } from "@venuecms/sdk-next";
import { getPage, getProducts, getSite } from "@venuecms/sdk-next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ListProduct } from "@/components/ListProduct";
import { Pagination } from "@/components/Pagination";

const ITEMS_PER_PAGE = 50;

export async function ProductsListContent({
  locale,
  currentPage,
  slug,
  baseUrl,
}: {
  locale: string;
  currentPage: number;
  /**
   * The page record backing this listing. Fetched for its title, which nothing
   * renders today — both this and /shop show a bare grid with no heading.
   */
  slug: string;
  /**
   * The route this listing is mounted at, for the pager's hrefs. Passed rather
   * than derived from `slug` because the two callers sit at unrelated paths:
   * the shop route is `/shop`, a PRODUCTLIST page is `/p/<slug>`.
   */
  baseUrl: string;
}) {
  await connection();

  const [{ data: products }, { data: page }, { data: site }, t] =
    await Promise.all([
      getProducts({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      }),
      getPage({ slug }),
      getSite(),
      getTranslations("shop"),
    ]);

  if (!site) {
    notFound();
  }

  // Calculate total pages
  const totalPages = products?.count
    ? Math.ceil(products.count / ITEMS_PER_PAGE)
    : 100;

  const pageTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : t("shop");

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
          : t("no_products_found")}
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
          baseUrl={baseUrl}
        />
      ) : null}
    </section>
  );
}
