import { VenueImage } from "@/components";
import { getLocalizedMetadata } from "@/lib";
import { Params } from "@/types";
import {
  LocalizedContent,
  getEvents,
  getLocalizedContent,
  getSite,
} from "@venuecms/sdk";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Link } from "@/lib/i18n";
import { VenueContent } from "@/lib/utils/renderer";

import { EventFeatured } from "@/components/EventFeatured";
import { EventsList, ListEvent } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { renderedStyles, setupSSR } from "@/components/utils";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}) => {
  const { locale } = await params;
  await setupSSR({ params });

  const { data: site } = await getSite();
  if (!site) {
    return {};
  }

  const metadata = getLocalizedMetadata({
    locale,
    site,
    overrides: {
      content: site.description ?? undefined,
    },
  });

  return metadata;
};

const Home = async ({ params }: { params: Promise<Params> }) => {
  await setupSSR({ params });
  const t = await getTranslations("events");
  const { locale } = await params;

  const [{ data: site }, { data: events }, { data: featuredEvents }] =
    await Promise.all([
      getSite(),
      getEvents({ limit: 6, upcoming: true }),
      getEvents({ limit: 6, featured: true }),
    ]);

  if (!site) {
    notFound();
  }

  // NOTE: This is in transition from this legacy object. All config will soon be attached to the webSite settings object instead
  const showHeroImage =
    site.settings?.publicSite?.template?.config?.showHeroImage;
  const noHeroOverlay =
    site.settings?.publicSite?.template?.config?.noHeroOverlay;
  const webSiteSettings = site.webSites ? site.webSites[0] : undefined;

  const { content } = webSiteSettings?.localizedContent?.length
    ? getLocalizedContent(webSiteSettings?.localizedContent, locale)
    : // This wedges in a legacy way, before we were localizing the site description for websites.
      // It is essentially falling back onto the general instance site description which is not localized
      // and is used mostly for listing info about an instnace that is not on a website.
      { content: { content: site.description } as LocalizedContent };

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
          {featuredEvents?.records.map((event) => (
            <EventFeatured
              key={event.id}
              event={event}
              site={site}
              className="lg:pb-64"
            />
          ))}
        </div>
      ) : null}

      <TwoColumnLayout>
        <ColumnLeft className="hidden text-sm text-secondary sm:flex">
          {site.description ? (
            <VenueContent
              className="flex flex-col gap-6"
              content={content}
              contentStyles={renderedStyles}
            />
          ) : null}
        </ColumnLeft>
        <ColumnRight>
          {events?.records.length ? (
            <section className="flex flex-col gap-3">
              <EventsList>
                {events.records.map((event) => (
                  <ListEvent key={event.id} event={event} site={site} />
                ))}
              </EventsList>
              {events.records.length >= 6 ? (
                <div className="w-full grid-cols-2 sm:grid">
                  <span></span>
                  <Link
                    className="flex w-full sm:relative sm:flex-row"
                    href="/events"
                  >
                    → {t("see_all_upcoming_events")}
                  </Link>
                </div>
              ) : null}
            </section>
          ) : null}
          {site.description ? (
            <div className="flex sm:hidden">
              <VenueContent
                className="flex flex-col gap-6"
                content={{ content: site.description } as LocalizedContent}
                contentStyles={renderedStyles}
              />
            </div>
          ) : null}
        </ColumnRight>
      </TwoColumnLayout>
    </>
  );
};

export default Home;
