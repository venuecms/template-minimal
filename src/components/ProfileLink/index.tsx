import {
  type Profile as VenueProfile,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";

export const ProfileLink = ({ profile }: { profile: VenueProfile }) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(profile?.localizedContent, locale);

  return (
    <div className="flex flex-row items-center gap-2 text-secondary transition-transform duration-300 hover:translate-x-1 hover:brightness-125">
      <ArrowRight className="h-4 w-4" />{" "}
      <Link href={`/artists/${profile.slug}`}>{content.title}</Link>
    </div>
  );
};
