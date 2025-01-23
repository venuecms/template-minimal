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
import { TwoSubColumnLayout } from "@/components/layout";

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

  return (
    <TwoSubColumnLayout className="py-20 sm:grid-cols-[repeat(4,minmax(16rem,32rem))]">
      {products?.records.length
        ? products.records.map((product) => <ListProduct product={product} />)
        : "No products found"}
    </TwoSubColumnLayout>
  );
};

export default ProductsPage;

const ListProduct = ({
  product,
  className,
}: {
  product: Product;
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
      <div className="w-full pb-3 sm:w-80 sm:max-w-full">
        <Link href={`/shop/${product.slug}`}>
          <VenueImage image={product.image} aspect="video" />
        </Link>
      </div>
      <div className="flex flex-col">
        <div className="text-primary">
          <Link href={`/shop/${product.slug}`}>{content.title}</Link>
        </div>
      </div>
    </div>
  );
};
