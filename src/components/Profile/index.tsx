import {
  type Profile as VenueProfile,
  getLocalizedContent,
} from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { ContentRender, RenderNode } from "@/lib/utils/renderer";

import { VenueImage } from "../VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";

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
        <div className="flex flex-col gap-6 pr-32">
          {(content.contentJSON?.content as Array<RenderNode>).map((node) => (
            <ContentRender node={node} />
          ))}
        </div>
      </ColumnRight>
    </TwoColumnLayout>
  );
};
