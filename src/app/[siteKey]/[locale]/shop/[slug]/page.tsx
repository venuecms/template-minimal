import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { notFound } from "next/navigation";

import { cachedGetProduct, cachedGetSite } from "@/lib/utils";

import { Product } from "@/components/Product";
import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(cachedGetProduct);

const ProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug } = await params;
  await setupSSR({ params });

  const [{ data: site }, { data: product }] = await Promise.all([
    cachedGetSite(),
    cachedGetProduct({ slug }),
  ]);

  if (!product || !site) {
    notFound();
  }

  return <Product product={product} site={site} />;
};

export default ProductPage;
