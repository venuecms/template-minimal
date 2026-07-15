import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";

import { cachedGetPage } from "@/lib/utils";

import { EventsListSection } from "@/components/EventsPage";
import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(() =>
  cachedGetPage({ slug: "events" }),
);

const EventsPage = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  await setupSSR({ params });

  return <EventsListSection locale={locale} />;
};

export default EventsPage;
