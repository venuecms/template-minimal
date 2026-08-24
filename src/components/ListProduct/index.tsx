import { Product, Site, getLocalizedContent } from "@venuecms/sdk-next";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { VenueImage } from "@/components/VenueImage";

const LEAD_COUNT = 4;

/**
 * The shop's product grid, shared so a product listing block draws the same
 * thing /shop does: the leading products in a four-column track, the rest in a
 * six-column one, which is what makes the first row read as the larger one.
 *
 * The two tracks are held apart by a gap on the column between them rather than
 * padding under the first. A block that fills only the first track sits
 * mid-article, where trailing padding would open a screenful of nothing between
 * the products and the prose under them.
 */
export const ProductsList = ({
  products,
  site,
  className,
}: {
  products: Product[];
  site: Site;
  className?: string;
}) => {
  const lead = products.slice(0, LEAD_COUNT);
  const rest = products.slice(LEAD_COUNT);

  return (
    <div className={cn("flex flex-col gap-20", className)}>
      <div className="grid gap-8 sm:max-w-full lg:grid-cols-2 xl:grid-cols-4">
        {lead.map((product) => (
          <ListProduct key={product.slug} product={product} site={site} />
        ))}
      </div>
      {rest.length ? (
        <div className="grid grid-cols-2 gap-8 sm:max-w-full lg:grid-cols-[repeat(4,minmax(1rem,32rem))] xl:grid-cols-[repeat(6,minmax(1rem,32rem))]">
          {rest.map((product) => (
            <ListProduct key={product.slug} product={product} site={site} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const ListProduct = ({
  product,
  site,
  className,
}: {
  product: Product;
  site: Site;
  className?: string;
}) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(product?.localizedContent, locale);

  return (
    <div
      className={cn(
        "flex break-inside-avoid flex-col gap-8 pb-8 sm:gap-0",
        className,
      )}
    >
      <div className="w-full pb-3 sm:w-auto sm:max-w-full">
        <Link href={`/shop/${product.slug}`}>
          <VenueImage image={product.image} aspect="square" />
        </Link>
      </div>
      <div className="flex flex-col">
        {product.author ? (
          <div className="text-secondary">{product.author}</div>
        ) : null}
        <div className="text-primary">
          <Link href={`/shop/${product.slug}`}>{content.title}</Link>
        </div>
      </div>
    </div>
  );
};
