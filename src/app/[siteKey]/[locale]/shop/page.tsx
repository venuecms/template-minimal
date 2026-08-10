import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { type SearchParams, getPage } from "@venuecms/sdk-next";

import { ProductsListSection } from "@/components/ShopPage";
import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(() =>
  getPage({ slug: "shop" }),
);

const ProductsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) => {
  const { locale } = await params;
  await setupSSR({ params });

  // Forwarded unawaited: the wait belongs inside the section's Suspense
  // boundary, not up here where it would hold the whole route.
  return <ProductsListSection locale={locale} searchParams={searchParams} />;
};

export default ProductsPage;
