import { getLocalizedMetadata } from "@/lib";
import { Params } from "@/types";

import { cachedGetSite } from "@/lib/utils";

import { EventsSection } from "@/components/HomePage/EventsSection";
import { FeaturedEventsSection } from "@/components/HomePage/FeaturedEventsSection";
import { ProductsSection } from "@/components/HomePage/ProductsSection";
import { setupSSR } from "@/components/utils";

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

  return (
    <>
      <FeaturedEventsSection locale={locale} />
      <EventsSection locale={locale} />
      <ProductsSection />
    </>
  );
};

export default Home;
