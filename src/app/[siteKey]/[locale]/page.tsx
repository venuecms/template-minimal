import { getLocalizedMetadata } from "@/lib";
import { Params } from "@/types";
import { LocalizedContent, getLocalizedContent } from "@venuecms/sdk";
import { cachedGetSite } from "@/lib/utils";
import { notFound } from "next/navigation";

import { setupSSR } from "@/components/utils";
import { FeaturedEventsSection } from "@/components/HomePage/FeaturedEventsSection";
import { EventsSection } from "@/components/HomePage/EventsSection";
import { ProductsSection } from "@/components/HomePage/ProductsSection";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}) => {
  const { locale } = await params;
  await setupSSR({ params });

  const { data: site } = await cachedGetSite();
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
  const { locale } = await params;

  // Only fetch critical site data - everything else streams
  const { data: site } = await cachedGetSite();

  if (!site) {
    notFound();
  }

  // NOTE: This is in transition from this legacy object. All config will soon be attached to the webSite settings object instead
  const templateSettings = (site?.settings?.publicSite?.template?.config ??
    {}) as { showHeroImage?: boolean; noHeroOverlay?: boolean };
  const { showHeroImage, noHeroOverlay } = templateSettings;
  const webSiteSettings = site.webSites ? site.webSites[0] : undefined;

  const { content } = webSiteSettings?.localizedContent?.length
    ? getLocalizedContent(webSiteSettings?.localizedContent, locale)
    : // This wedges in a legacy way, before we were localizing the site description for websites.
      // It is essentially falling back onto the general instance site description which is not localized
      // and is used mostly for listing info about an instnace that is not on a website.
      { content: { content: site.description } as LocalizedContent };

  return (
    <>
    <div className="flex flex-col">
      {/* Featured events stream in when ready */}
      <FeaturedEventsSection
        locale={locale}
        showHeroImage={showHeroImage}
        noHeroOverlay={noHeroOverlay}
      />

      {/* Events section streams independently */}
      <EventsSection locale={locale} siteContent={{ content }} />

artist template testing

      {/* Products section streams last */}
      <ProductsSection />
    </div>
    </>
  );
};

export default Home;
