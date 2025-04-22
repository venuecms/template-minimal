import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import {
  Product,
  Site,
  getLocalizedContent,
  getPage,
  getProducts,
  getSite,
} from "@venuecms/sdk";
import { useLocale } from "next-intl";
import { notFound } from "next/navigation";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { Pagination } from "@/components/Pagination";
import { VenueImage } from "@/components/VenueImage";
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
}) => {
  const { locale } = await params;
  await setupSSR({ params });

  const currentPage = parseInt(searchParams?.page as string, 10) || 0;

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
          totalPages={
            // TODO: a quick hack. we need to update the API
            (moreProducts.length ?? 0) + (topProducts?.length ?? 0) <
            ITEMS_PER_PAGE
              ? currentPage
              : totalPages
          }
          baseUrl={`/shop`} // Use locale in base URL
        />
      ) : null}
    </section>
  );
};

export default ProductsPage;

const ListProduct = ({
  product,
  site,
  featured,
  className,
}: {
  product: Product;
  site: Site;
  featured?: boolean;
  className?: string;
}) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(product?.localizedContent, locale);

  return (
    <div
      className={cn(
        "flex break-inside-avoid flex-col gap-8 pb-8 sm:gap-0",
        className,
      )}
    >
      <div className="w-full pb-3 sm:w-auto sm:max-w-full">
        <Link href={`/shop/${product.slug}`}>
          <VenueImage image={product.image} aspect="square" />
        </Link>
      </div>
      <div className="flex flex-col">
        {product.author ? (
          <div className="text-secondary">{product.author}</div>
        ) : null}
        <div className="text-primary">
          <Link href={`/shop/${product.slug}`}>{content.title}</Link>
        </div>
      </div>
    </div>
  );
};
