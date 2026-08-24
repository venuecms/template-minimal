import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { type SearchParams, getPage } from "@venuecms/sdk-next";

import { ProductsLayout, ProductsListSection } from "@/components/ShopPage";
import { setupSSR } from "@/components/utils";
import { readPage } from "@/components/utils/searchParams";

export const generateMetadata = getGenerateMetadata(() =>
  getPage({ slug: "shop" }),
);

/**
 * The route composes the layout and the listing itself, the same way a
 * PRODUCTLIST page ends up with a products block inside `ProductsLayout`. The
 * layout holds no listing of its own, so this is the only thing that puts the
 * two together for /shop.
 */
const ProductsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) => {
  await setupSSR({ params });

  const resolvedSearchParams = await searchParams;

  return (
    <ProductsLayout>
      <ProductsListSection
        currentPage={readPage(resolvedSearchParams)}
        basePath="/shop"
        searchParams={resolvedSearchParams}
      />
    </ProductsLayout>
  );
};

export default ProductsPage;
