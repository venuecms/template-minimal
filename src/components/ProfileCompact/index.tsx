import {
  type Profile as VenueProfile,
  getLocalizedContent,
} from "@venuecms/sdk-next";
// Deliberately the SDK renderer, not @/components/VenueContent: this bio is
// itself what a profile listing renders, so resolving listing blocks here would
// let a profile listing nest inside its own results.
import { VenueContent } from "@venuecms/sdk-next";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";

import { VenueImage } from "@/components/VenueImage";

import { renderedStyles } from "../utils";

export const ProfileCompact = ({ profile }: { profile: VenueProfile }) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(profile?.localizedContent, locale);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/artists/${profile.slug}`}>
          <VenueImage image={profile.image} aspect="video" />
        </Link>
      </div>
      <div className="text-secondary hover:brightness-125">
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
