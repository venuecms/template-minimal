import { getEvents } from "@venuecms/sdk";
import { NextRequest } from "next/server";
import RSS from "rss";

export const GET = async (req: NextRequest) => {
  const events = await getEvents({
    // dir: "desc",
    limit: 20,
    page: 0,
  });

  const site_url = "https://fylkingen.se";

  const feedOptions = {
    title: "Fylkingen -  - ny musik &amp; intermediakonst",
    description: "Fylkingen Events",
    site_url,
    feed_url: `${site_url}/rss.xml`,
    image_url: `${site_url}/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlightLogo.656c577e.png&w=3840&q=75`,
    pubDate: events[0]?.startDate || new Date(),
    copyright: `All rights reserved ${new Date().getFullYear()}`,
  };

  const feed = new RSS(feedOptions);

  // Add each individual post to the feed.
  events.map((event) => {
    const { content } = getLocalizedContent(event.localizedContent, "sv");
    feed.item({
      title: content.title,
      description: content.shortContent || content.content,
      url: `${site_url}/events/${event.slug}`,
      // date: event.startDate,
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: new Headers({
      "Content-Type": "application/rss+xml",
    }),
  });
};
