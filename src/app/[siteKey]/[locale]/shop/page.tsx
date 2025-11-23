import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getPage } from "@venuecms/sdk";

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
  searchParams: Promise<{ page: string }>;
}) => {
  const { locale } = await params;
  await setupSSR({ params });

  const currentPage = parseInt((await searchParams)?.page as string, 10) || 0;

  return <ProductsListSection locale={locale} currentPage={currentPage} />;
};

export default ProductsPage;
