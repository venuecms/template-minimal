import {
  type Profile as VenueProfile,
  getLocalizedContent,
} from "@venuecms/sdk";
import { useLocale, useTranslations } from "next-intl";
import { Suspense } from "react";

import { VenueContent } from "@/lib/utils/renderer";

import { VenueImage } from "../VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { renderedStyles } from "../utils";
import { ProfileEventList, ProfileEventListSkeleton } from "./ProfileEventList";

export const Profile = ({ profile }: { profile: VenueProfile }) => {
  const locale = useLocale();
  const t = useTranslations("events");

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
        <Suspense fallback={<ProfileEventListSkeleton numElements={1} />}>
          <ProfileEventList
            header={t("upcoming_events")}
            slug={profile.slug}
            filter={{ upcoming: true, dir: "asc" }}
          />
        </Suspense>
        <Suspense fallback={null}>
          <ProfileEventList
            header={t("past_events")}
            slug={profile.slug}
            filter={{ lt: Date.now(), dir: "desc" }}
          />
        </Suspense>
      </ColumnRight>
    </TwoColumnLayout>
  );
};
