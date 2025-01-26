import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import {
  Product,
  getLocalizedContent,
  getPage,
  getProducts,
  getSite,
  setConfig,
} from "@venuecms/sdk";
import { useLocale } from "next-intl";
import { notFound } from "next/navigation";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { VenueImage } from "@/components/VenueImage";

export const generateMetadata = getGenerateMetadata(() =>
  getPage({ slug: "shop" }),
);

const ProductsPage = async ({ params }: { params: Promise<Params> }) => {
  const { siteKey, locale } = await params;
  setConfig({ siteKey });

  const [{ data: products }, { data: page }, { data: site }] =
    await Promise.all([
      getProducts({ limit: 60 }),
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
              />
            ))
          : "No products found"}
      </div>
      {moreProducts?.length ? (
        <div className="grid grid-cols-2 gap-8 sm:max-w-full lg:grid-cols-[repeat(4,minmax(1rem,32rem))] xl:grid-cols-[repeat(6,minmax(1rem,32rem))]">
          {moreProducts.map((product) => (
            <ListProduct key={product.slug} product={product} />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default ProductsPage;

const ListProduct = ({
  product,
  featured,
  className,
}: {
  product: Product;
  featured?: boolean;
  className?: string;
}) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(product?.localizedContent, locale);
  const { variants = [] } = product;

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

        {featured && variants.length > 0 ? (
          <div className="flex items-center gap-4 pt-2">
            {variants.map((variant) => (
              <>
                <div key={variant.productType?.type} className="text-secondary">
                  {variant.productType?.type}
                </div>
                {variant.price > 0 ? (
                  <div
                    key={variant.productType?.type + "price"}
                    className="border border-muted px-2 py-1 text-muted"
                  >
                    {variant.price}
                  </div>
                ) : null}
              </>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
