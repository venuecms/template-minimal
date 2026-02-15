import { connection } from "next/server";
import { cachedGetProducts, cachedGetSite } from "@/lib/utils";

import { Link } from "@/lib/i18n";

import { ListProduct } from "@/components/ListProduct";

export async function ProductsContent() {
  await connection();

  const [{ data: products }, { data: site }] = await Promise.all([
    cachedGetProducts({ limit: 10 }),
    cachedGetSite(),
  ]);

  if (!site) return null;

  // Only show for specific sites
  if (site.name !== "ELNA" && site.name !== "infant tree") {
    return null;
  }

  const topProducts = products?.records.slice(0, 4);
  const moreProducts = products?.records.slice(4);

  return (
    <section className="py-20">
      <p className="pb-8 text-primary">
        <Link href="/shop">Works</Link>
      </p>

      <div className="grid grid-cols-2 gap-8 pb-20 sm:max-w-full sm:grid-cols-4 xl:grid-cols-4">
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
        <div className="grid grid-cols-2 gap-8 sm:max-w-full lg:grid-cols-[repeat(4,minmax(1rem,32rem))] xl:grid-cols-[repeat(6,minmax(1rem,32rem))]">
          {moreProducts.map((product) => (
            <ListProduct key={product.slug} product={product} site={site} />
          ))}
        </div>
      ) : null}
      <div className="w-full grid-cols-3 sm:grid">
        <span></span>
        <span></span>
        <Link className="flex w-full sm:relative sm:flex-row" href="/shop">
          → see all works
        </Link>
      </div>
    </section>
  );
}
