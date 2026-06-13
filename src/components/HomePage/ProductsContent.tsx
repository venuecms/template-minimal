import { connection } from "next/server";

import { Link } from "@/lib/i18n";
import { cachedGetProducts, cachedGetSite } from "@/lib/utils";

import { ListProduct } from "@/components/ListProduct";

export async function ProductsContent() {
  await connection();

  const [{ data: products }, { data: site }] = await Promise.all([
    cachedGetProducts({ limit: 10 }),
    cachedGetSite(),
  ]);

  if (!site) return null;

  const topProducts = products?.records.slice(0, 6);
  const moreProducts = products?.records.slice(4);

  return (
    <section className="flex flex-col gap-0.5 py-20">
      <div className="grid grid-cols-2 gap-0.5 sm:max-w-full sm:grid-cols-3 xl:grid-cols-3">
        {topProducts?.length
          ? topProducts.map((product) => (
              <ListProduct
                key={product.slug}
                featured={true}
                product={product}
                site={site}
              />
            ))
          : "No products found"}
      </div>
      {moreProducts?.length ? (
        <div className="bg-product hover:bg-product-highlight col-span-3 w-full grid-cols-3 px-4 py-8 text-center transition duration-150">
          <Link
            className="flex w-full hover:opacity-70 sm:relative sm:flex-row sm:justify-center"
            href="/shop"
          >
            see all records and books
          </Link>
        </div>
      ) : null}
    </section>
  );
}
