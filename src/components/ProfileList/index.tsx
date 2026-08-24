import type { Profile } from "@venuecms/sdk-next";

import { ProfileCompact } from "@/components/ProfileCompact";
import { TwoSubColumnLayout } from "@/components/layout";

/**
 * The grid of profile cards, shared by the profile listing page and the
 * `profileListing` content block so those two cannot draw the same records two
 * different ways.
 *
 * Not yet shared by the three grids that render a *record's* attached artists —
 * `Page`, `Event` and `Product` each still inline this markup. They are the
 * same grid and should move here, but that is a change to pages this branch
 * does not otherwise touch, and one no test here would catch regressing.
 *
 * The sibling of `EventsList` for events; a plain function of the records it is
 * handed, and the one list that needs no `site` to draw.
 */
export const ProfilesList = ({
  profiles,
  className,
}: {
  profiles: readonly Profile[];
  className?: string;
}) => (
  <TwoSubColumnLayout className={className}>
    {profiles.map((profile) => (
      <ProfileCompact key={profile.slug} profile={profile} />
    ))}
  </TwoSubColumnLayout>
);
