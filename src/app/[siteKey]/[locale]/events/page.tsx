import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getPage } from "@venuecms/sdk";

import { EventsListSection } from "@/components/EventsPage";
import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(() =>
  getPage({ slug: "events" }),
);

const EventsPage = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  await setupSSR({ params });

  return <EventsListSection locale={locale} />;
};

export default EventsPage;
