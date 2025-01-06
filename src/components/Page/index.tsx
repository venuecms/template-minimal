import { type Page as VenuePage, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { VenueContent } from "@/lib/utils/renderer";

import { PageTree } from "../PageTree";
import { VenueImage } from "../VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { renderedStyles } from "../utils";

export const Page = ({
  page,
  pages,
}: {
  page: VenuePage;
  pages: Array<VenuePage & { parent?: VenuePage }>;
}) => {
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
          <PageTree pages={pages} />
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
