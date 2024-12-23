import {
  type Profile as VenueProfile,
  getLocalizedContent,
} from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";
import { ContentRender } from "@/lib/utils/renderer";

export const ProfileCompact = ({ profile }: { profile: VenueProfile }) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(profile?.localizedContent, locale);

  console.log("CONTENT", content);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-secondary font-regular">
        <Link href={`/artists/${profile.slug}`}>{content.title}</Link>
      </div>

      {content.contentJSON?.content.map((node) => (
        <ContentRender node={node} />
      ))}
    </div>
  );
};
