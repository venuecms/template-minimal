import { VenueImage } from "@venuecms/sdk-next";
import { getEvents, getSite } from "@venuecms/sdk-next";
import { connection } from "next/server";

import { EventFeatured } from "@/components/EventFeatured";

export async function FeaturedEventsContent({ locale }: { locale: string }) {
  await connection();

  const [{ data: featuredEvents }, { data: site }] = await Promise.all([
    getEvents({ limit: 6, featured: true }),
    getSite(),
  ]);

  if (!site) return null;

  const templateSettings = (site?.settings?.publicSite?.template?.config ??
    {}) as { showHeroImage?: boolean; noHeroOverlay?: boolean };
  const { showHeroImage, noHeroOverlay } = templateSettings;
  const webSiteSettings = site.webSites ? site.webSites[0] : undefined;

  return (
    <>
      {showHeroImage ? (
        <div className="w-vw absolute left-0 top-0 -z-30 h-svh w-screen bg-red-300">
          <VenueImage aspect="video" image={webSiteSettings?.image} />
          {noHeroOverlay ? null : (
            <div className="absolute left-0 top-0 h-full w-full bg-[#1F1C1F] bg-cover bg-center bg-no-repeat opacity-80">
              <div className="absolute inset-0 bg-[#1F1C1F]"></div>
            </div>
          )}
        </div>
      ) : null}
      {featuredEvents?.records.length ? (
        <div className="flex flex-col pb-16">
          {featuredEvents.records.map((event) => (
            <EventFeatured
              key={event.id}
              event={event}
              site={site}
              className="lg:pb-64"
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
