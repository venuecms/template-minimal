import type { Profile } from "@venuecms/sdk-next";

import { ProfileCompact } from "@/components/ProfileCompact";
import { TwoSubColumnLayout } from "@/components/layout";

/**
 * The grid of profile cards, shared by the profile listing page and the profile
 * listing block, so a page typed `PROFILELIST` and a `profileListing` block in
 * someone's prose cannot end up drawing the same records two different ways.
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
