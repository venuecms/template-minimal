import {
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

  console.log("SITE", site);
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
              <div className="flex items-center gap-4 pt-2">
                {variants.map((variant) => (
                  <>
                    <div key={variant.productType?.type} className="text-muted">
                      {variant.productType?.type}
                    </div>
                    {variant.price > 0 ? (
                      <div
                        key={variant.productType?.type + "price"}
                        className="border border-secondary px-2 py-1 text-secondary"
                      >
                        {variant.price} {variant.currency}
                      </div>
                    ) : null}
                  </>
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
            <ProfileCompact key={profile.slug} profile={{ ...profile, site }} />
          ))}
        </TwoSubColumnLayout>
      </ColumnRight>
    </TwoColumnLayout>
  );
};
