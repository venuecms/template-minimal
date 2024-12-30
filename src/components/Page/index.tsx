import { type Page as VenuePage, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { VenueContent } from "@/lib/utils/renderer";

import { VenueImage } from "../VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { renderedStyles } from "../utils";

export const Page = ({ page }: { page: VenuePage }) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(page?.localizedContent, locale);

  return (
    <TwoColumnLayout>
      <ColumnLeft>
        <div className="flex flex-col gap-12">
          <div>
            <div>{content.title}</div>
          </div>
          <VenueImage image={page.image} />
        </div>
      </ColumnLeft>

      <ColumnRight>
        <VenueContent
          className="flex flex-col gap-6 max-w-[42rem] text-sm"
          content={content}
          contentStyles={renderedStyles}
        />
      </ColumnRight>
    </TwoColumnLayout>
  );
};
