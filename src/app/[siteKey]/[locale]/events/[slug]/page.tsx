import { Event } from "@/components";
import { getLocalizedMetadata } from "@/lib";
import { Params } from "@/types";
import { getEvent, getSite, setConfig } from "@venuecms/sdk";
import { notFound } from "next/navigation";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params & { slug: string }>;
}) => {
  const { siteKey, slug, locale } = await params;
  setConfig({ siteKey });

  const [{ data: site }, { data: item }] = await Promise.all([
    getSite(),
    getEvent({ slug }),
  ]);

  if (!site || !item) {
    return {};
  }

  const metadata = getLocalizedMetadata({
    locale,
    item,
    site,
  });

  return metadata;
};

const EventsPage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug, siteKey } = await params;
  setConfig({ siteKey });

  const { data: event } = await getEvent({ slug });

  if (!event) {
    notFound();
  }

  return <Event event={event} />;
};

export default EventsPage;
