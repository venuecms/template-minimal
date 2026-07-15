import {
  type Page as VenuePage,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { VenueContent, VenueImage } from "@venuecms/sdk-next";
import { useLocale } from "next-intl";

import { PageWithParent } from "@/lib/utils/tree";

import { PageTree } from "../PageTree";
import { ProfileCompact } from "../ProfileCompact";
import {
  ColumnLeft,
  ColumnRight,
  TwoColumnLayout,
  TwoSubColumnLayout,
} from "../layout";
import { renderedStyles } from "../utils";

export const Page = ({
  page,
  pages,
}: {
  page: VenuePage;
  pages: Array<PageWithParent>;
}) => {
  const locale = useLocale();

  const { artists = [] } = page;
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
          className="flex max-w-[42rem] flex-col gap-6 text-sm"
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
