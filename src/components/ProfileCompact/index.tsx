import {
  type Profile as VenueProfile,
  getLocalizedContent,
} from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";
import { VenueContent } from "@/lib/utils/renderer";

import { renderedStyles } from "../utils";

export const ProfileCompact = ({ profile }: { profile: VenueProfile }) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(profile?.localizedContent, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-secondary font-regular">
        <Link href={`/artists/${profile.slug}`}>{content.title}</Link>
      </div>

      <VenueContent
        className="flex flex-col gap-6 pr-4"
        content={content}
        contentStyles={renderedStyles}
      />
    </div>
  );
};
