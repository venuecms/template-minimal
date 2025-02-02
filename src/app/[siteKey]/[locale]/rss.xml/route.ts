import { Params } from "@/types";
import {
  getEvents,
  getLocalizedContent,
  getSite,
  setConfig,
} from "@venuecms/sdk";
import { NextRequest } from "next/server";
import removeMarkdown from "remove-markdown";
import RSS from "rss";

import { formatDate, getPublicImage } from "@/components/utils";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<Params> },
) => {
  const { siteKey, locale } = await params;

  setConfig({
    siteKey,
    options: { next: { revalidate: 60 } },
  });

  const [{ data: events }, { data: site }] = await Promise.all([
    getEvents({
      dir: "desc",
      limit: 20,
      page: 0,
    }),
    getSite(),
  ]);

  if (!site || !events) {
    return new Response(null, {
      status: 404,
    });
  }

  const eventList = events.records;

  const host =
    site.settings.publicSite?.baseUrl ??
    `https://${req.headers.get("x-forwarded-host")}`;

  const site_url = host.endsWith("/") ? host.slice(0, -1) : host;

  const feedOptions = {
    title: site.name ?? site_url,
    description: `${site.name} Events`,
    site_url,
    feed_url: `${site_url}/${locale}/rss.xml`,
    image_url: site.image
      ? `${site_url}/${getPublicImage(site.image)}`
      : undefined,
    pubDate: eventList[0]?.startDate || new Date().toISOString(),
    copyright: `All rights reserved ${new Date().getFullYear()}`,
  };

  const feed = new RSS(feedOptions);

  // Add each individual post to the feed.
  eventList.map((event) => {
    const { content } = getLocalizedContent(event.localizedContent, locale);

    feed.item({
      title: content.title ?? "",
      description: `${formatDate({ date: event.startDate, withTime: event.hasTime, timeZone: site.timeZone! })}:\n ${removeMarkdown(content.shortContent || content.content || "")}`,
      url: `${site_url}/events/${event.slug}`,
      date: event.startDate,
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: new Headers({
      "Content-Type": "application/rss+xml",
    }),
  });
};
