import { connection } from "next/server";

import { cachedGetProfileProducts, cachedGetSite } from "@/lib/utils";

import { ListProduct } from "@/components/ListProduct";
import { Skeleton } from "@/components/ui/Input/Skeleton";

import { ProductsListContent } from "../ShopPage/ProductsListContent";

export const ProfileProductList = async ({
  header,
  slug,
}: {
  header: string;
  slug: string;
}) => {
  await connection();

  const [{ data: products }, { data: site }] = await Promise.all([
    cachedGetProfileProducts({ slug, limit: 60 }),
    cachedGetSite(),
  ]);

  if (!site) {
    return null;
  }

  return products?.records.length ? (
    <div className="flex flex-col gap-6">
      <h2 className="m-0 py-0 text-sm text-primary">{header}</h2>
      {/* TODO: This should use the shop page title */}
      <div className="grid w-full grid-cols-1 gap-6 pb-6 md:grid-cols-3">
        {products.records.map((product) => (
          <ListProduct key={product.slug} product={product} site={site} />
        ))}
      </div>
    </div>
  ) : null;
};

export const ProfileProductListSkeleton = ({
  numElements = 2,
}: {
  numElements?: number;
}) => {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="w-1/4" />
      {Array.from({ length: numElements }).map((_, index) => (
        <Skeleton key={index} className="h-48 w-[90%]" />
      ))}
    </div>
  );
};
