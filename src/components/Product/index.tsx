import {
  ProductVariant,
  Site,
  Product as VenueProduct,
  getLocalizedContent,
} from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";
import { VenueContent } from "@/lib/utils/renderer";

import { ProfileCompact } from "../ProfileCompact";
import { VenueImage } from "../VenueImage";
import {
  ColumnLeft,
  ColumnRight,
  TwoColumnLayout,
  TwoSubColumnLayout,
} from "../layout";
import { renderedStyles } from "../utils/styles";

export const Product = ({
  product,
  site,
}: {
  product: VenueProduct;
  site: Site;
}) => {
  const locale = useLocale();
  const { artists, variants = [] } = product;

  const { content } = getLocalizedContent(product?.localizedContent, locale);

  return (
    <TwoColumnLayout>
      <ColumnLeft>
        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-10">
            <div>
              {product.author ? (
                <div className={cn("text-secondary")}>{product.author}</div>
              ) : null}
              <div>{content.title}</div>
            </div>
            {variants.length > 0 ? (
              <div className="flex flex-col gap-4 pt-2">
                {variants.map((variant) => (
                  <div
                    key={variant.productType?.type}
                    className="flex items-center gap-8"
                  >
                    <div className="text-muted">
                      {variant.productType?.type}
                    </div>
                    <VariantPriceWithoutFree variant={variant} site={site} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <VenueImage image={product.image} />
        </div>
      </ColumnLeft>

      <ColumnRight className="max-w-4xl">
        <VenueContent
          className="flex flex-col gap-6 sm:pr-32"
          content={content}
          contentStyles={renderedStyles}
        />
        <TwoSubColumnLayout>
          {artists.map(({ profile }) => (
            <ProfileCompact key={profile.slug} profile={profile} />
          ))}
        </TwoSubColumnLayout>
      </ColumnRight>
    </TwoColumnLayout>
  );
};

const VariantPrice = ({
  variant,
  site,
}: {
  variant: ProductVariant;
  site: Site;
}) => {
  const displayPrice =
    variant.price > 0
      ? `${variant.price} ${variant.currency || site.settings?.defaults?.currency || ""}`
      : variant.price === 0
        ? "Free"
        : "";
  return variant.externalLink || variant.price > 0 ? (
    <div
      key={variant.productType?.type + "price"}
      className="border border-muted px-2 py-1 text-secondary"
    >
      {variant.externalLink ? (
        <a
          href={variant.externalLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {displayPrice}
        </a>
      ) : (
        variant.price > 0 && displayPrice
      )}
    </div>
  ) : null;
};

const VariantPriceWithoutFree = ({
  variant,
  site,
}: {
  variant: ProductVariant;
  site: Site;
}) => {
  return variant.price > 0 ? (
    <div
      key={variant.productType?.type + "price"}
      className="border border-muted px-2 py-1 text-secondary"
    >
      {variant.externalLink ? (
        <a
          href={variant.externalLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {variant.price}{" "}
          {variant.currency || site.settings?.defaults?.currency || ""}
        </a>
      ) : (
        `${variant.price} ${variant.currency || site.settings?.defaults?.currency || ""}`
      )}
    </div>
  ) : null;
};
