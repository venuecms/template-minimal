import {
  type Profile as VenueProfile,
  getLocalizedContent,
} from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";
import { VenueContent } from "@/lib/utils/renderer";
import { VenueImage } from "../VenueImage";

import { renderedStyles } from "../utils";

export const ProfileCompact = ({ profile }: { profile: VenueProfile }) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(profile?.localizedContent, locale);

  return (
    <div className="flex flex-col group gap-6 text-sm">
      
        <Link
          className="relative h-48 w-full overflow-hidden"
          href={`/artists/${profile.slug}`}>
          <VenueImage className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" image={profile.image} />
        </Link>
      <div className="text-secondary hover:brightness-150">
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
