import {
  type Profile as VenueProfile,
  getLocalizedContent,
} from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { VenueContent } from "@/lib/utils/renderer";

import { VenueImage } from "../VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { renderedStyles } from "../utils";

export const Profile = ({ profile }: { profile: VenueProfile }) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(profile?.localizedContent, locale);

  return (
    <TwoColumnLayout>
      <ColumnLeft>
        <div className="flex flex-col gap-12">
          <div>
            <div>{content.title}</div>
          </div>
          <VenueImage image={profile.image} />
        </div>
      </ColumnLeft>

      <ColumnRight>
        <VenueContent
          className="flex flex-col gap-6 pr-32"
          content={content}
          contentStyles={renderedStyles}
        />
      </ColumnRight>
    </TwoColumnLayout>
  );
};
