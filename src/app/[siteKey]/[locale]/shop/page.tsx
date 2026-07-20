import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getPage } from "@venuecms/sdk-next";
import { VenueContent } from "@venuecms/sdk-next";
import { getLocalizedContent } from "@venuecms/sdk-next";

import { ProductsListSection } from "@/components/ShopPage";
import { ColumnRight, TwoColumnLayout } from "@/components/layout";
import { renderedStyles, setupSSR } from "@/components/utils";

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

  const { data: page } = await getPage({ slug: "shop" });
  const { content } = getLocalizedContent(page?.localizedContent, locale);
  return (
    <>
      <TwoColumnLayout className="pb-0 lg:py-8 lg:pb-0">
        <ColumnRight>
          <VenueContent
            className="flex max-w-[42rem] flex-col gap-6 text-sm"
            content={content}
            contentStyles={renderedStyles}
          />
        </ColumnRight>
      </TwoColumnLayout>
      <ProductsListSection locale={locale} currentPage={currentPage} />
    </>
  );
};
export default ProductsPage;
