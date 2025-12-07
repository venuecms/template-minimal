import { Event } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { cachedGetEvent, cachedGetSite } from "@/lib/utils";
import { notFound } from "next/navigation";

import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(cachedGetEvent);

const EventsPage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug } = await params;
  await setupSSR({ params });

  const [{ data: event }, { data: site }] = await Promise.all([
    cachedGetEvent({ slug }),
    cachedGetSite(),
  ]);

  if (!event || !site) {
    notFound();
  }

  return <Event event={event} site={site} />;
};

export default EventsPage;
