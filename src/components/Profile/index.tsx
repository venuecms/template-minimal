import {
  type Profile as VenueProfile,
  getLocalizedContent,
} from "@venuecms/sdk";
import { useLocale } from "next-intl";
import { Suspense } from "react";

import { VenueContent } from "@/lib/utils/renderer";

import { VenueImage } from "../VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { renderedStyles } from "../utils";
import { ProfileEventList, ProfileEventListSkeleton } from "./ProfileEventList";

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

      <ColumnRight className="max-w-5xl">
        <VenueContent
          className="flex flex-col gap-6 sm:pr-32"
          content={content}
          contentStyles={renderedStyles}
        />
        <Suspense fallback={<ProfileEventListSkeleton />}>
          <ProfileEventList
            header="Upcoming Events"
            slug={profile.slug}
            site={profile.site}
            filter={{ upcoming: true }}
          />
        </Suspense>
        <Suspense fallback={<ProfileEventListSkeleton />}>
          <ProfileEventList
            header="Past Events"
            slug={profile.slug}
            site={profile.site}
            filter={{ lt: Date.now() }}
          />
        </Suspense>
      </ColumnRight>
    </TwoColumnLayout>
  );
};
