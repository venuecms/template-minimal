import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getEvent, getProduct, getSite, setConfig } from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { Product } from "@/components/Product";

export const generateMetadata = getGenerateMetadata(getEvent);

const ProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug, siteKey } = await params;
  setConfig({ siteKey });

  const [{ data: site }, { data: product }] = await Promise.all([
    getSite(),
    getProduct({ slug }),
  ]);

  if (!product) {
    notFound();
  }

  return <Product product={product} site={site} />;
};

export default ProductPage;
