import { Event } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getEvent, getSite, setConfig } from "@venuecms/sdk";
import { notFound } from "next/navigation";

export const generateMetadata = getGenerateMetadata(getEvent);

const EventsPage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug, siteKey } = await params;
  setConfig({ siteKey });

  const [{ data: event }, { data: site }] = await Promise.all([
    getEvent({ slug }),
    getSite(),
  ]);

  if (!event || !site) {
    notFound();
  }

  return <Event event={event} site={site} />;
};

export default EventsPage;
