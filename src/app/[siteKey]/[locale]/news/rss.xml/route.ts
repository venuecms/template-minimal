import { Params } from "@/types";
import { getLocalizedContent } from "@venuecms/sdk";
import { NextRequest } from "next/server";
import removeMarkdown from "remove-markdown";
import RSS from "rss";

import { cachedGetNews, cachedGetSite } from "@/lib/utils";

import { getPublicImage, setupSSR } from "@/components/utils";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<Params> },
) => {
  const { locale } = await params;
  await setupSSR({ params });

  const [{ data: news }, { data: site }] = await Promise.all([
    cachedGetNews({
      dir: "desc",
      limit: 20,
    }),
    cachedGetSite(),
  ]);

  if (!site || !news) {
    return new Response(null, {
      status: 404,
    });
  }

  const newsList = news.records;

  const itemDate = (item: (typeof newsList)[number]) =>
    typeof item.date === "string" ? item.date : undefined;

  const host =
    site.settings.publicSite?.baseUrl ??
    `https://${req.headers.get("x-forwarded-host")}`;

  const site_url = host.endsWith("/") ? host.slice(0, -1) : host;

  const feedOptions = {
    title: `${site.name ?? site_url} News`,
    description: `${site.name} News`,
    site_url,
    feed_url: `${site_url}/${locale}/news/rss.xml`,
    image_url: site.image
      ? `${site_url}/${getPublicImage(site.image)}`
      : undefined,
    pubDate:
      (newsList[0] ? itemDate(newsList[0]) : undefined) ||
      new Date().toISOString(),
    copyright: `All rights reserved ${new Date().getFullYear()}`,
  };

  const feed = new RSS(feedOptions);

  newsList.map((item) => {
    const { content } = getLocalizedContent(item.localizedContent, locale);

    feed.item({
      title: content.title ?? "",
      description: removeMarkdown(
        content.shortContent || content.content || "",
      ),
      url: `${site_url}/news/${item.slug}`,
      date: itemDate(item) ?? new Date().toISOString(),
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: new Headers({
      "Content-Type": "application/rss+xml",
    }),
  });
};
