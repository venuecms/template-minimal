import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import {
  getLocalizedContent,
  getPage,
  getProducts,
  getSite,
} from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { ListProduct } from "@/components/ListProduct";
import { Pagination } from "@/components/Pagination";
import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(() =>
  getPage({ slug: "shop" }),
);

const ITEMS_PER_PAGE = 50;

const ProductsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ page: string }>;
}) => {
  const { locale } = await params;
  await setupSSR({ params });

  const currentPage = parseInt((await searchParams)?.page as string, 10) || 0;

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

  // Calculate total pages
  const totalPages = products?.count
    ? Math.ceil(products.count / ITEMS_PER_PAGE)
    : 100;

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
      {moreProducts?.length && totalPages > 1 ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages - 1}
          baseUrl={`/shop`}
        />
      ) : null}
    </section>
  );
};

export default ProductsPage;
