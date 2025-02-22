import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getProduct, getSite } from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { Product } from "@/components/Product";
import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(getProduct);

const ProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
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

  return <Product product={product} site={site} />;
};

export default ProductPage;
