import { Product, Site, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { VenueImage } from "../VenueImage";

export const ListProduct = ({
  product,
  site,
  featured,
  className,
}: {
  product: Product;
  site: Site;
  featured?: boolean;
  className?: string;
}) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(product?.localizedContent, locale);

  return (
    <div
      className={cn(
        "bg-product hover:bg-product-highlight flex break-inside-avoid flex-col gap-4 p-4 transition duration-150 sm:gap-4",
        className,
      )}
    >
      <Link href={`/shop/${product.slug}`}>
        <div className="flex flex-col">
          {product.author ? (
            <div className="text-primary">{product.author}</div>
          ) : null}
          <div className="text-primary opacity-70">{content.title}</div>
        </div>
        <div className="w-full p-12 transition duration-1000 hover:scale-105 sm:w-auto sm:max-w-full">
          <VenueImage
            image={product.image}
            aspect="square"
            className="shadow-md"
          />
        </div>
      </Link>
    </div>
  );
};
