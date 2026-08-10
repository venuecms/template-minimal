import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { type SearchParams, getProduct, getSite } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";

import { Product } from "@/components/Product";
import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(getProduct);

const ProductPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string } & Params>;
  // Read here and handed down because only a route segment can: a listing block
  // sits too deep inside the content to ask for the URL it is being paged by.
  searchParams: Promise<SearchParams>;
}) => {
  const { slug } = await params;
  await setupSSR({ params });

  const [{ data: site }, { data: product }] = await Promise.all([
    getSite(),
    getProduct({ slug }),
  ]);

  if (!product || !site) {
    notFound();
  }

  return (
    <Product product={product} site={site} searchParams={await searchParams} />
  );
};

export default ProductPage;
